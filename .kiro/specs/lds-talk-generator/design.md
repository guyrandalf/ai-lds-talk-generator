# Design Document - LDS Talk Generator

## Overview

The LDS Talk Generator is a Next.js 16 application that provides an AI-powered platform for creating sacrament meeting and stake conference talks. The system leverages server actions for backend operations, Tailwind CSS for responsive design, Prisma ORM with Supabase for data persistence, and XAI API for content generation while ensuring all content sources are restricted to official Church domains.

## Architecture

### Technology Stack
- **Frontend**: Next.js 16 with React 19, Tailwind CSS 4
- **Backend**: Next.js Server Actions
- **Database**: Supabase with Prisma ORM
- **AI Integration**: XAI API
- **Authentication**: Custom email/password with secure sessions
- **Document Export**: Server-side Word document generation
- **Styling**: Tailwind CSS with responsive design

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │   External      │
│                 │    │                 │    │   Services      │
│ - Landing Page  │◄──►│ - Server Actions│◄──►│ - XAI API       │
│ - Auth Forms    │    │ - API Routes    │    │ - Supabase DB   │
│ - Talk Interface│    │ - Middleware    │    │                 │
│ - Settings UI   │    │ - Validation    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components and Interfaces

### Core Components

#### 1. Landing Page (`app/page.tsx`)
- Hero section with instant input bar
- Authentication call-to-action
- Responsive design with Tailwind CSS
- Guest access to talk generation

#### 2. Authentication System
- **Registration Form** (`app/auth/register/page.tsx`)
  - Email, password, first name, last name fields
  - Server action for user creation
  - Form validation and error handling

- **Login Form** (`app/auth/login/page.tsx`)
  - Email and password authentication
  - Session management
  - Redirect handling for protected routes

#### 3. Talk Generation Interface
- **Questionnaire Component** (`components/TalkQuestionnaire.tsx`)
  - Personal story input
  - Gospel Library link validation
  - Meeting type selection
  - Duration customization
  - Topic and theme preferences

- **Talk Display Component** (`components/TalkDisplay.tsx`)
  - Generated talk content rendering
  - Export to Word functionality
  - Save talk option (authenticated users)
  - Edit and regenerate options

#### 4. User Dashboard (`app/dashboard/page.tsx`)
- Saved talks list
- Talk management (edit, delete, export)
- User settings access
- Quick talk generation

#### 5. Settings Interface (`app/settings/page.tsx`)
- Name update form
- Password change form
- Account preferences
- Server actions for updates

### Server Actions

#### Authentication Actions (`lib/actions/auth.ts`)
```typescript
// User registration
async function registerUser(formData: FormData)

// User login
async function loginUser(formData: FormData)

// Logout
async function logoutUser()

// Update user profile
async function updateProfile(formData: FormData)

// Change password
async function changePassword(formData: FormData)
```

#### Talk Management Actions (`lib/actions/talks.ts`)
```typescript
// Generate talk with XAI
async function generateTalk(questionnaire: TalkQuestionnaire)

// Save talk to database
async function saveTalk(talkData: TalkData, userId: string)

// Get user's saved talks
async function getUserTalks(userId: string)

// Delete talk
async function deleteTalk(talkId: string, userId: string)

// Export talk to Word
async function exportTalkToWord(talkId: string)
```

#### Content Validation (`lib/actions/validation.ts`)
```typescript
// Validate Church domain links
async function validateChurchContent(content: string)

// Sanitize user input
async function sanitizeInput(input: string)
```

## Data Models

### Database Schema (Prisma)

#### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  talks     Talk[]
  
  @@map("users")
}
```

#### Talk Model
```prisma
model Talk {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  duration    Int      // Minutes
  meetingType String   // "sacrament" | "stake_conference"
  topic       String?
  
  // Questionnaire responses
  personalStory    String?  @db.Text
  gospelLibraryLinks String[] // Array of validated Church links
  preferences      Json?    // Additional customization
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("talks")
}
```

### TypeScript Interfaces

#### Talk Questionnaire Interface
```typescript
interface TalkQuestionnaire {
  topic: string;
  duration: number;
  meetingType: 'sacrament' | 'stake_conference';
  personalStory?: string;
  gospelLibraryLinks: string[];
  audienceType?: string;
  preferredThemes: string[];
  specificScriptures?: string[];
}
```

#### Generated Talk Interface
```typescript
interface GeneratedTalk {
  id?: string;
  title: string;
  content: string;
  duration: number;
  meetingType: string;
  sources: ChurchSource[];
  questionnaire: TalkQuestionnaire;
  createdAt?: Date;
}

interface ChurchSource {
  title: string;
  url: string;
  type: 'scripture' | 'conference_talk' | 'manual' | 'article';
}
```

## XAI Integration

### AI Prompt Engineering
The system will use carefully crafted prompts to ensure:
- First-person perspective throughout
- Natural transitions between sections
- Integration of personal stories
- Appropriate talk structure (introduction, body, testimony)
- Adherence to specified duration
- Use of only Church-approved sources

### Content Validation Pipeline
1. **Input Validation**: Verify all user-provided links are from churchofjesuschrist.org
2. **AI Generation**: Send validated inputs to XAI with structured prompts
3. **Output Validation**: Scan generated content for non-Church references
4. **Content Sanitization**: Remove or flag any inappropriate content
5. **Final Review**: Ensure talk meets structural requirements

### Sample AI Prompt Structure
```
Generate a {duration}-minute {meetingType} talk on "{topic}" written in first person.

Personal Context:
- Personal story: {personalStory}
- Gospel Library references: {gospelLibraryLinks}
- Preferred themes: {preferredThemes}

Requirements:
- Write as if the speaker is delivering personally
- Include smooth transitions between sections
- Incorporate the personal story naturally
- Reference only churchofjesuschrist.org sources
- End with personal testimony
- Structure: Introduction → Main points → Personal application → Testimony
```

## Error Handling

### Client-Side Error Handling
- Form validation with real-time feedback
- Network error recovery
- Loading states and user feedback
- Graceful degradation for offline scenarios

### Server-Side Error Handling
- Input validation and sanitization
- Database connection error handling
- XAI API error recovery
- Authentication error management
- Comprehensive logging for debugging

### Error Types and Responses
```typescript
enum ErrorType {
  VALIDATION_ERROR = 'validation_error',
  AUTH_ERROR = 'auth_error',
  AI_SERVICE_ERROR = 'ai_service_error',
  DATABASE_ERROR = 'database_error',
  EXPORT_ERROR = 'export_error'
}

interface ErrorResponse {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}
```

## Testing Strategy

### Unit Testing
- Server actions validation
- Database operations
- Content validation functions
- Authentication logic
- Form validation utilities

### Integration Testing
- XAI API integration
- Database connectivity
- Authentication flow
- Talk generation pipeline
- Export functionality

### End-to-End Testing
- Complete user registration and login flow
- Talk generation from questionnaire to export
- User dashboard functionality
- Settings management
- Cross-device responsive behavior

### Security Testing
- Input sanitization validation
- Authentication bypass attempts
- SQL injection prevention
- XSS protection verification
- Session management security

## Security Considerations

### Authentication Security
- Password hashing with bcrypt
- Secure session management
- CSRF protection
- Rate limiting on auth endpoints

### Data Protection
- Input sanitization and validation
- SQL injection prevention through Prisma
- XSS protection in content rendering
- Secure handling of user data

### Content Security
- Strict validation of Church domain sources
- Content sanitization before storage
- Prevention of malicious link injection
- Audit trail for generated content

## Performance Optimization

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization for responsive design
- Lazy loading of non-critical components
- Efficient state management

### Backend Optimization
- Database query optimization with Prisma
- Caching strategies for frequently accessed data
- Efficient server action implementations
- Connection pooling for database operations

### AI Integration Optimization
- Request batching where possible
- Caching of similar talk requests
- Timeout handling for AI service calls
- Fallback mechanisms for service unavailability

## Deployment Architecture

### Environment Configuration
- Development: Local Supabase with Prisma migrations
- Staging: Supabase cloud with test data
- Production: Supabase cloud with production security

### Environment Variables
```
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
XAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### Monitoring and Analytics
- Error tracking and logging
- Performance monitoring
- User analytics (privacy-compliant)
- Database performance metrics