# Employly - AI-Powered Job Matching & Web3 Networking

A full-stack web application for job matching, featuring AI-powered skill extraction and Web3 blockchain payment integration.

## 🎨 Brand Colors

- **Ruby Red**: `#E31C58` - Primary accent
- **Parrot Green**: `#00C853` - Success, wallet connected
- **Gold**: `#FFB800` - Highlights

## 🚀 Features

### Core
- **JWT Authentication** - Register, login, profile management
- **Job Listings** - Create, browse, filter, and apply
- **Social Feed** - Share updates, likes, comments
- **AI Skill Extraction** - OpenAI-powered or keyword fallback
- **Job Matching Scores** - NLP-based 0-100% compatibility

### Web3
- **MetaMask Integration** - Wallet connection
- **Polygon Mumbai** - Testnet blockchain
- **Platform Fee** - 0.00001 MATIC per job post
- **On-chain Verification** - Transaction verification

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Blockchain | Polygon Mumbai, Ethers.js |
| AI | OpenAI GPT-3.5 |

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your credentials in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ADMIN_WALLET=0x...
NEXT_PUBLIC_POLYGON_RPC=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CHAIN_ID=80001
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/        # API routes
│   ├── auth/       # Login, register
│   ├── jobs/       # Job pages
│   ├── feed/       # Social feed
│   └── profile/    # User profile
├── components/
│   ├── ui/         # Navbar
│   ├── jobs/       # JobCard
│   ├── ai/         # MatchScore
│   └── web3/       # WalletConnect
├── context/        # Auth, Web3 providers
├── lib/            # Utilities
└── models/         # Mongoose schemas
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/jobs` | List jobs |
| POST | `/api/jobs` | Create job (requires payment) |
| POST | `/api/jobs/[id]/apply` | Apply to job |
| GET | `/api/feed` | List posts |
| POST | `/api/feed` | Create post |

## 💳 Web3 Payment Flow

1. User fills job form → Continue to Payment
2. Connect MetaMask → Switch to Polygon Mumbai
3. Pay 0.00001 MATIC → Transaction confirmed
4. Job created with verified txHash

## 🚀 Deployment

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod
```

Get testnet MATIC: [Polygon Faucet](https://faucet.polygon.technology/)

---

Built with ❤️ using Next.js, MongoDB, OpenAI, and Polygon
