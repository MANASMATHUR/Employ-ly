import OpenAI from 'openai';

// Lazy-load OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;
export function getOpenAI(): OpenAI | null {
    if (!process.env.OPENAI_API_KEY) return null;
    if (!openai) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}

// Common tech skills for matching
const COMMON_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch',
    'Solidity', 'Web3', 'Blockchain', 'Smart Contracts', 'Ethereum', 'Solana',
    'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'UI/UX Design', 'Figma',
    'Agile', 'Scrum', 'Project Management', 'Leadership', 'Communication',
    'Data Analysis', 'SQL', 'Tableau', 'Power BI', 'Excel',
    'Mobile Development', 'React Native', 'Flutter', 'Swift', 'Kotlin',
];

export interface SkillExtractionResult {
    skills: string[];
    confidence: number;
}

export interface MatchResult {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendation: string;
}

// Extract skills from bio or resume text using OpenAI
export async function extractSkills(text: string): Promise<SkillExtractionResult> {
    try {
        const client = getOpenAI();
        if (!client) {
            // Fallback to keyword matching if no API key
            return extractSkillsKeyword(text);
        }

        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a skill extraction expert. Extract technical and professional skills from the given text. 
          Return ONLY a JSON object with this format: {"skills": ["skill1", "skill2", ...], "confidence": 0.0-1.0}
          Focus on: programming languages, frameworks, tools, platforms, soft skills, and domain expertise.
          Normalize skill names (e.g., "JS" -> "JavaScript", "ML" -> "Machine Learning").
          Maximum 15 skills, sorted by relevance.`,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content || '';

        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                skills: parsed.skills || [],
                confidence: parsed.confidence || 0.5,
            };
        }

        return extractSkillsKeyword(text);
    } catch (error) {
        console.error('OpenAI skill extraction error:', error);
        return extractSkillsKeyword(text);
    }
}

// Fallback keyword-based skill extraction
function extractSkillsKeyword(text: string): SkillExtractionResult {
    const textLower = text.toLowerCase();
    const foundSkills: string[] = [];

    for (const skill of COMMON_SKILLS) {
        const skillLower = skill.toLowerCase();
        // Check for exact word match or variations
        const patterns = [
            new RegExp(`\\b${skillLower}\\b`, 'i'),
            new RegExp(`\\b${skillLower.replace(/\./g, '')}\\b`, 'i'),
            new RegExp(`\\b${skillLower.replace(/\s+/g, '')}\\b`, 'i'),
        ];

        if (patterns.some(p => p.test(textLower))) {
            foundSkills.push(skill);
        }
    }

    return {
        skills: [...new Set(foundSkills)].slice(0, 15),
        confidence: foundSkills.length > 0 ? 0.7 : 0.3,
    };
}

// Calculate match score between user profile and job listing
export async function calculateMatchScore(
    userSkills: string[],
    userBio: string,
    jobSkills: string[],
    jobDescription: string
): Promise<MatchResult> {
    try {
        const client = getOpenAI();
        if (!client) {
            return calculateMatchScoreBasic(userSkills, jobSkills);
        }

        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a job matching expert. Analyze the candidate profile against the job requirements.
          Return ONLY a JSON object with this format:
          {
            "score": 0-100,
            "matchedSkills": ["skill1", ...],
            "missingSkills": ["skill1", ...],
            "recommendation": "brief recommendation string"
          }
          Consider both exact skill matches and related/transferable skills.`,
                },
                {
                    role: 'user',
                    content: `
Candidate Skills: ${userSkills.join(', ')}
Candidate Bio: ${userBio}

Job Required Skills: ${jobSkills.join(', ')}
Job Description: ${jobDescription}
          `,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content || '';

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                score: Math.min(100, Math.max(0, parsed.score || 0)),
                matchedSkills: parsed.matchedSkills || [],
                missingSkills: parsed.missingSkills || [],
                recommendation: parsed.recommendation || 'No recommendation available',
            };
        }

        return calculateMatchScoreBasic(userSkills, jobSkills);
    } catch (error) {
        console.error('OpenAI match score error:', error);
        return calculateMatchScoreBasic(userSkills, jobSkills);
    }
}

// Basic skill matching without AI
function calculateMatchScoreBasic(userSkills: string[], jobSkills: string[]): MatchResult {
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (let i = 0; i < jobSkills.length; i++) {
        if (userSkillsLower.includes(jobSkillsLower[i])) {
            matchedSkills.push(jobSkills[i]);
        } else {
            missingSkills.push(jobSkills[i]);
        }
    }

    const score = jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;

    let recommendation: string;
    if (score >= 80) {
        recommendation = 'Excellent match! Apply now.';
    } else if (score >= 60) {
        recommendation = 'Good match. Consider upskilling in missing areas.';
    } else if (score >= 40) {
        recommendation = 'Partial match. Review requirements carefully.';
    } else {
        recommendation = 'Limited match. Focus on building relevant skills.';
    }

    return { score, matchedSkills, missingSkills, recommendation };
}

// Get recommended jobs based on user profile
export async function getRecommendedJobs(
    userSkills: string[],
    userBio: string,
    jobs: Array<{ _id: string; title: string; requiredSkills: string[]; description: string }>
): Promise<Array<{ jobId: string; score: number; recommendation: string }>> {
    const recommendations = await Promise.all(
        jobs.map(async (job) => {
            const match = await calculateMatchScore(
                userSkills,
                userBio,
                job.requiredSkills,
                job.description
            );
            return {
                jobId: job._id,
                score: match.score,
                recommendation: match.recommendation,
            };
        })
    );

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
}

// Smart job suggestions based on profile analysis
export async function getSmartSuggestions(userBio: string, userSkills: string[]): Promise<string[]> {
    try {
        const client = getOpenAI();
        if (!client) {
            return getBasicSuggestions(userSkills);
        }

        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a career advisor. Based on the user's profile, suggest job roles and career paths.
          Return ONLY a JSON array of 5 job title suggestions: ["Job Title 1", "Job Title 2", ...]`,
                },
                {
                    role: 'user',
                    content: `Skills: ${userSkills.join(', ')}\nBio: ${userBio}`,
                },
            ],
            temperature: 0.5,
            max_tokens: 200,
        });

        const content = response.choices[0]?.message?.content || '';
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            return JSON.parse(arrayMatch[0]);
        }

        return getBasicSuggestions(userSkills);
    } catch (error) {
        console.error('Smart suggestions error:', error);
        return getBasicSuggestions(userSkills);
    }
}

function getBasicSuggestions(skills: string[]): string[] {
    const suggestionMap: { [key: string]: string[] } = {
        'react': ['Frontend Developer', 'React Developer', 'Full Stack Developer'],
        'node.js': ['Backend Developer', 'Node.js Developer', 'Full Stack Developer'],
        'python': ['Python Developer', 'Data Scientist', 'ML Engineer'],
        'machine learning': ['ML Engineer', 'Data Scientist', 'AI Researcher'],
        'solidity': ['Blockchain Developer', 'Smart Contract Engineer', 'Web3 Developer'],
        'aws': ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect'],
    };

    const suggestions = new Set<string>();
    for (const skill of skills) {
        const skillLower = skill.toLowerCase();
        for (const [key, roles] of Object.entries(suggestionMap)) {
            if (skillLower.includes(key)) {
                roles.forEach(r => suggestions.add(r));
            }
        }
    }

    return Array.from(suggestions).slice(0, 5);
}
