# Requirements Document

## Introduction

The LDS Talk Generator is a Next.js 16 web application that helps members of The Church of Jesus Christ of Latter-day Saints create sacrament meeting and stake conference talks. The system uses server actions, Tailwind CSS for responsive design, and integrates with XAI API to generate personalized talks based exclusively on official Church content. Users can authenticate, customize settings, and export talks to Word documents.

## Glossary

- **Talk_Generator_System**: The complete Next.js 16 web application with server actions, Tailwind CSS styling, and responsive design
- **User**: An authenticated member with email, first name, and last name who creates and manages talks
- **Guest_User**: An unauthenticated visitor who can view the landing page and input interface
- **Talk**: A generated speech content for sacrament meetings or stake conferences with customizable duration
- **XAI_Service**: The external AI service used for content generation
- **Church_Content**: Official content from churchofjesuschrist.org domain only
- **Export_Document**: A Word document (.docx) containing the generated talk content
- **User_Settings**: User account preferences including name and password management
- **Server_Actions**: Next.js server-side functions for handling form submissions and data operations
- **Talk_Questionnaire**: Pre-generation form collecting personal stories, scripture references, and contextual information
- **Gospel_Library_Link**: References to talks, scriptures, or other content from the Church's Gospel Library
- **Personal_Story**: User-provided personal experiences or anecdotes related to the talk topic
- **Talk_Flow**: The natural progression and structure of the generated talk with smooth transitions
- **Database_System**: Supabase database with Prisma ORM for data persistence and management
- **User_Data**: Stored user account information, authentication credentials, and profile data
- **Talk_Data**: Stored talk content, metadata, questionnaire responses, and user associations

## Requirements

### Requirement 1

**User Story:** As a church member, I want to access a responsive landing page with an instant input interface, so that I can quickly start generating a talk on any device.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL display a landing page with Tailwind CSS responsive design
2. THE Talk_Generator_System SHALL provide an instant input bar for talk generation requests
3. THE Talk_Generator_System SHALL present authentication options prominently on the landing page
4. THE Talk_Generator_System SHALL maintain responsive design across desktop, tablet, and mobile devices
5. THE Talk_Generator_System SHALL use Tailwind CSS for all styling and layout

### Requirement 2

**User Story:** As a church member, I want to register and authenticate with email and password, so that I can save and manage my generated talks.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL provide user registration with email, password, first name, and last name
2. THE Talk_Generator_System SHALL authenticate users using email and password credentials
3. THE Talk_Generator_System SHALL use Server_Actions for authentication operations
4. THE Talk_Generator_System SHALL store User_Data in Database_System using Prisma ORM
5. WHEN a Guest_User attempts to save a talk, THE Talk_Generator_System SHALL redirect to authentication
6. THE Talk_Generator_System SHALL maintain secure user sessions
7. THE Talk_Generator_System SHALL allow authenticated users to access their saved talks

### Requirement 3

**User Story:** As an authenticated user, I want to manage my account settings, so that I can update my name and password as needed.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL provide User_Settings interface for authenticated users
2. THE Talk_Generator_System SHALL allow users to update their first name and last name
3. THE Talk_Generator_System SHALL allow users to change their password
4. THE Talk_Generator_System SHALL use Server_Actions for settings update operations
5. THE Talk_Generator_System SHALL validate password changes with current password confirmation

### Requirement 4

**User Story:** As a church member, I want to provide personal context and preferences before talk generation, so that the AI can create a more personalized and meaningful talk.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL present a Talk_Questionnaire before generating content
2. THE Talk_Generator_System SHALL collect Personal_Story information related to the talk topic
3. THE Talk_Generator_System SHALL allow users to provide Gospel_Library_Link references to specific talks or scriptures
4. THE Talk_Generator_System SHALL gather additional contextual information such as audience type, personal experiences, and preferred themes
5. THE Talk_Generator_System SHALL use Server_Actions to process questionnaire responses
6. THE Talk_Generator_System SHALL validate Gospel_Library_Link references against churchofjesuschrist.org domain

### Requirement 5

**User Story:** As a church member, I want the AI to generate talks using only official Church content, so that I can trust the doctrinal accuracy and appropriateness of the material.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL integrate with XAI_Service for content generation
2. THE Talk_Generator_System SHALL restrict all content sources to churchofjesuschrist.org domain exclusively
3. THE Talk_Generator_System SHALL reject any requests referencing non-Church sources
4. THE Talk_Generator_System SHALL validate all generated content links against churchofjesuschrist.org domain
5. IF a request contains non-Church sources, THEN THE Talk_Generator_System SHALL return an error message
6. THE Talk_Generator_System SHALL use Server_Actions for AI service integration

### Requirement 6

**User Story:** As a church member, I want to specify talk duration and customize parameters, so that I can generate talks appropriate for different meeting types and time constraints.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL default to 15-minute talk duration
2. THE Talk_Generator_System SHALL allow users to specify custom talk durations
3. THE Talk_Generator_System SHALL provide options for different meeting types (sacrament meeting, stake conference)
4. THE Talk_Generator_System SHALL generate content appropriate to the specified duration and context
5. THE Talk_Generator_System SHALL use Server_Actions for talk generation requests

### Requirement 7

**User Story:** As a church member, I want my generated talk to flow naturally as if I'm delivering it personally, so that it feels authentic and engaging to my audience.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL generate talks written in first person perspective
2. THE Talk_Generator_System SHALL create smooth transitions between talk sections and topics
3. THE Talk_Generator_System SHALL incorporate Personal_Story elements naturally within the Talk_Flow
4. THE Talk_Generator_System SHALL structure talks with logical progression from introduction to conclusion
5. THE Talk_Generator_System SHALL include a personal testimony to close each generated talk
6. THE Talk_Generator_System SHALL ensure the talk reads as if the user is personally delivering it

### Requirement 8

**User Story:** As a church member, I want to export my generated talk to a Word document, so that I can edit and format it according to my preferences.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL provide export functionality for generated talks
2. THE Talk_Generator_System SHALL generate Export_Documents in Microsoft Word format (.docx)
3. THE Talk_Generator_System SHALL preserve talk structure and formatting in exported documents
4. THE Talk_Generator_System SHALL include all generated content and source references in exports
5. THE Talk_Generator_System SHALL allow both authenticated and guest users to export talks
6. THE Talk_Generator_System SHALL use Server_Actions for document export operations

### Requirement 9

**User Story:** As an authenticated church member, I want to save and manage my talks, so that I can access them later for review or reuse.

#### Acceptance Criteria

1. WHEN a User is authenticated, THE Talk_Generator_System SHALL provide talk saving functionality
2. THE Talk_Generator_System SHALL store Talk_Data in Database_System using Prisma ORM
3. THE Talk_Generator_System SHALL associate saved talks with User_Data through database relationships
4. THE Talk_Generator_System SHALL allow users to view their saved talks list
5. THE Talk_Generator_System SHALL provide options to edit, delete, or re-export saved talks
6. THE Talk_Generator_System SHALL maintain talk metadata including creation date and parameters
7. THE Talk_Generator_System SHALL use Server_Actions for talk management operations

### Requirement 10

**User Story:** As a system administrator, I want a properly structured database schema, so that user data and talks are stored efficiently and securely.

#### Acceptance Criteria

1. THE Talk_Generator_System SHALL use Supabase as the Database_System
2. THE Talk_Generator_System SHALL use Prisma ORM for database schema management and queries
3. THE Talk_Generator_System SHALL define database schema for User_Data including authentication and profile information
4. THE Talk_Generator_System SHALL define database schema for Talk_Data including content, metadata, and questionnaire responses
5. THE Talk_Generator_System SHALL establish proper relationships between users and their talks
6. THE Talk_Generator_System SHALL implement database migrations through Prisma
7. THE Talk_Generator_System SHALL ensure data integrity and security through proper schema constraints