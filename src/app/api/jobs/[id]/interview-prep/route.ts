import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';
import { formatErrorResponse, logger, AuthenticationError, NotFoundError } from '@/lib/errors';
import mongoose from 'mongoose';

interface InterviewQuestion {
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    tip: string;
}

// Keyword-based question templates
const QUESTION_TEMPLATES = {
    technical: {
        'react': [
            { q: "Walk me through how you'd optimize a slow React component.", tip: "Mention useMemo, React.memo, code splitting" },
            { q: "How do you manage complex state in React applications?", tip: "Discuss Context, Redux, or Zustand patterns" },
        ],
        'node.js': [
            { q: "How would you design a scalable API that handles 10k requests/sec?", tip: "Talk about caching, load balancing, async patterns" },
            { q: "Explain how you'd handle errors in a Node.js application.", tip: "Mention error middleware, try-catch, logging" },
        ],
        'typescript': [
            { q: "When would you use generics vs union types?", tip: "Show understanding of type safety trade-offs" },
            { q: "How do you handle third-party libraries without type definitions?", tip: "Mention declaration files, @types packages" },
        ],
        'python': [
            { q: "How would you optimize a slow Python data pipeline?", tip: "Discuss generators, multiprocessing, vectorization" },
            { q: "Explain the GIL and when it matters.", tip: "Show you understand threading limitations" },
        ],
        'mongodb': [
            { q: "How do you design schemas for a many-to-many relationship?", tip: "Discuss embedding vs referencing trade-offs" },
            { q: "What indexing strategies would you use for a search-heavy app?", tip: "Mention compound indexes, text search" },
        ],
        'aws': [
            { q: "Design a serverless architecture for a file processing system.", tip: "Use Lambda, S3, SQS patterns" },
            { q: "How would you reduce costs on AWS by 30%?", tip: "Mention right-sizing, reserved instances, spot" },
        ],
        'blockchain': [
            { q: "Explain the trade-offs between L1 and L2 solutions.", tip: "Show understanding of scaling challenges" },
            { q: "How would you design a gas-efficient smart contract?", tip: "Discuss storage optimization, batch operations" },
        ],
        'machine learning': [
            { q: "How do you handle class imbalance in a classification problem?", tip: "Mention oversampling, SMOTE, class weights" },
            { q: "Walk me through your model deployment pipeline.", tip: "Discuss versioning, monitoring, A/B testing" },
        ],
    },
    behavioral: [
        { q: "Tell me about a project that failed. What did you learn?", tip: "Be honest, focus on growth and lessons" },
        { q: "Describe a time you disagreed with a technical decision.", tip: "Show collaboration over being 'right'" },
        { q: "How do you prioritize when everything is urgent?", tip: "Demonstrate a framework for decision-making" },
        { q: "Tell me about code you wrote that you're proud of.", tip: "Pick something with impact, explain trade-offs" },
    ],
    situational: [
        { q: "How would you approach learning a new technology for this role?", tip: "Show your learning process, resources" },
        { q: "What would you do in your first 30 days here?", tip: "Balance learning, contributing, relationship-building" },
        { q: "How would you handle a teammate who's not pulling their weight?", tip: "Start with empathy, then escalation path" },
    ],
};

function generateQuestions(jobSkills: string[], jobDescription: string, userSkills: string[]): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    const usedSkills = new Set<string>();

    // Technical questions based on job skills
    for (const skill of jobSkills.slice(0, 3)) {
        const skillLower = skill.toLowerCase();
        for (const [key, templates] of Object.entries(QUESTION_TEMPLATES.technical)) {
            if (skillLower.includes(key) && !usedSkills.has(key)) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                questions.push({
                    question: template.q,
                    type: 'technical',
                    tip: template.tip,
                });
                usedSkills.add(key);
                break;
            }
        }
    }

    // Fill with generic technical if needed
    if (questions.length < 2) {
        questions.push({
            question: `How would you approach building ${jobDescription.split(' ').slice(0, 5).join(' ')}...?`,
            type: 'technical',
            tip: 'Break down the problem, discuss architecture, mention trade-offs',
        });
    }

    // Add behavioral questions
    const behavioral = QUESTION_TEMPLATES.behavioral;
    const b1 = behavioral[Math.floor(Math.random() * behavioral.length)];
    const b2 = behavioral[Math.floor(Math.random() * behavioral.length)];
    questions.push({ question: b1.q, type: 'behavioral', tip: b1.tip });
    questions.push({ question: b2.q, type: 'behavioral', tip: b2.tip });

    // Add situational based on skill gaps
    const missingSkills = jobSkills.filter(js =>
        !userSkills.some(us => us.toLowerCase().includes(js.toLowerCase()))
    );

    if (missingSkills.length > 0) {
        questions.push({
            question: `This role requires ${missingSkills.slice(0, 2).join(' and ')}. How would you get up to speed?`,
            type: 'situational',
            tip: 'Show a concrete learning plan with timeline',
        });
    } else {
        const sit = QUESTION_TEMPLATES.situational[0];
        questions.push({ question: sit.q, type: 'situational', tip: sit.tip });
    }

    // Unique: Role-specific question
    questions.push({
        question: "What would you build for us in your first 90 days that isn't in the job description?",
        type: 'situational',
        tip: 'Show initiative and product thinking—they want to see you go beyond the spec',
    });

    return questions.slice(0, 6);
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getUserFromRequest(request);
        if (!auth) {
            throw new AuthenticationError();
        }

        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new NotFoundError('Job');
        }

        await connectDB();

        const [job, user] = await Promise.all([
            Job.findById(id),
            User.findById(auth.userId),
        ]);

        if (!job) {
            throw new NotFoundError('Job');
        }

        if (!user) {
            throw new NotFoundError('User');
        }

        const questions = generateQuestions(
            job.requiredSkills,
            job.description,
            user.skills || []
        );

        logger.info('Interview prep generated', { jobId: id, userId: auth.userId });

        return NextResponse.json({
            success: true,
            questions,
            jobTitle: job.title,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        const { message, statusCode } = formatErrorResponse(error);
        logger.error('Interview prep error', error);
        return NextResponse.json(
            { success: false, error: message },
            { status: statusCode }
        );
    }
}
