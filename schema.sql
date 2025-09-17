--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (1b53132)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CampaignStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CampaignStatus" AS ENUM (
    'Finished',
    'Active',
    'Upcoming'
);


--
-- Name: EdgeCondition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EdgeCondition" AS ENUM (
    'TRUE',
    'FALSE',
    'ALWAYS'
);


--
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY'
);


--
-- Name: Progress; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Progress" AS ENUM (
    'Beginning',
    'Email_added',
    'Mail_sent',
    'Verified',
    'Summary_added'
);


--
-- Name: Relation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Relation" AS ENUM (
    'team_leader',
    'managed_me_directly',
    'ex_cxo_VP',
    'same_team'
);


--
-- Name: SkillCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SkillCategory" AS ENUM (
    'DEVELOPMENT_AND_TECH',
    'DESIGN',
    'VIDEO_EDITING',
    'PRODUCT',
    'MARKETING',
    'BUSINESS',
    'OTHERS'
);


--
-- Name: SkillType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SkillType" AS ENUM (
    'INTEREST',
    'ROLE'
);


--
-- Name: TemplateType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TemplateType" AS ENUM (
    'Verification_Request',
    'Verification_Result',
    'Request_Hr_Mail',
    'WELCOME_EMAIL',
    'PASSWORD_RESET',
    'SUBSCRIPTION_CONFIRMATION',
    'GENERAL_NOTIFICATION'
);


--
-- Name: VerificationOutcome; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationOutcome" AS ENUM (
    'SUCCESS',
    'FAILURE',
    'PENDING',
    'EXPIRED'
);


--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'VERIFIED',
    'UNVERIFIED'
);


--
-- Name: VerificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationType" AS ENUM (
    'ADDRESS_AADHAAR',
    'BANK_PENNY_DROP',
    'PF_EPFO'
);


--
-- Name: WorkType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WorkType" AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'INTERNSHIP',
    'CONTRACT_BASED'
);


--
-- Name: WorkflowNodeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WorkflowNodeType" AS ENUM (
    'ACTION',
    'CONDITION',
    'DELAY',
    'START',
    'END'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Campaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Campaign" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    company_id integer NOT NULL,
    status public."CampaignStatus" DEFAULT 'Active'::public."CampaignStatus" NOT NULL
);


--
-- Name: CampaignUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CampaignUser" (
    user_id integer NOT NULL,
    campaign_id integer NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Campaign_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Campaign_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Campaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Campaign_id_seq" OWNED BY public."Campaign".id;


--
-- Name: Company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Company" (
    id integer NOT NULL,
    name text NOT NULL,
    admin_id integer,
    "senderEmail" text,
    "smtpHost" text,
    "smtpPassword" text,
    "smtpPort" integer,
    "smtpUser" text,
    "defaultPasswordResetTemplateId" integer,
    "defaultRequestHrMailTemplateId" integer,
    "defaultVerificationRequestTemplateId" integer,
    "defaultVerificationResultTemplateId" integer,
    "defaultWelcomeEmailTemplateId" integer,
    type text
);


--
-- Name: Company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Company_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Company_id_seq" OWNED BY public."Company".id;


--
-- Name: Education; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Education" (
    id integer NOT NULL,
    degree text NOT NULL,
    institution text NOT NULL,
    branch text,
    roll_number text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    grade_in_cgpa double precision,
    description text,
    user_id integer NOT NULL
);


--
-- Name: Education_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Education_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Education_id_seq" OWNED BY public."Education".id;


--
-- Name: EmailTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailTemplate" (
    id integer NOT NULL,
    name text NOT NULL,
    type public."TemplateType" NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    company_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: EmailTemplate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EmailTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EmailTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EmailTemplate_id_seq" OWNED BY public."EmailTemplate".id;


--
-- Name: Feature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Feature" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    cost numeric(65,30)
);


--
-- Name: Feature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Feature_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Feature_id_seq" OWNED BY public."Feature".id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "employeeId" integer NOT NULL,
    "workExperienceId" integer NOT NULL,
    channel text NOT NULL,
    status text NOT NULL,
    payload text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Plan" (
    id integer NOT NULL,
    name text NOT NULL,
    "priceMonthly" numeric(65,30) NOT NULL,
    "priceAnnually" numeric(65,30) NOT NULL,
    "verificationLimit" integer DEFAULT 5 NOT NULL
);


--
-- Name: PlanFeature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlanFeature" (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    feature_id integer NOT NULL,
    "isIncluded" boolean DEFAULT true NOT NULL,
    "limit" integer
);


--
-- Name: PlanFeature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PlanFeature_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PlanFeature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PlanFeature_id_seq" OWNED BY public."PlanFeature".id;


--
-- Name: Plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Plan_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Plan_id_seq" OWNED BY public."Plan".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RolePermission" (
    id integer NOT NULL,
    role_name text NOT NULL,
    "accessCompanies" boolean DEFAULT false NOT NULL,
    packages boolean DEFAULT false NOT NULL,
    "supportTeam" boolean DEFAULT false NOT NULL,
    "searchLogin" boolean DEFAULT false NOT NULL,
    "assignManageCompanyStaff" boolean DEFAULT false NOT NULL,
    "initiateVerifications" boolean DEFAULT false NOT NULL,
    "manageAgentStaff" boolean DEFAULT false NOT NULL,
    "manageSystemSettings" boolean DEFAULT false NOT NULL,
    "viewReportsStatistics" boolean DEFAULT false NOT NULL,
    "viewVerificationResults" boolean DEFAULT false NOT NULL
);


--
-- Name: RolePermission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."RolePermission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: RolePermission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."RolePermission_id_seq" OWNED BY public."RolePermission".id;


--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


--
-- Name: Skill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Skill" (
    id integer NOT NULL,
    name text NOT NULL,
    category public."SkillCategory" NOT NULL,
    image_url text,
    "skillType" public."SkillType" DEFAULT 'ROLE'::public."SkillType" NOT NULL,
    endorsements integer DEFAULT 0 NOT NULL,
    is_verified boolean DEFAULT false NOT NULL
);


--
-- Name: Skill_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Skill_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Skill_id_seq" OWNED BY public."Skill".id;


--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subscription" (
    id integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "currentPeriodEnds" timestamp(3) without time zone NOT NULL,
    company_id integer NOT NULL,
    plan_id integer NOT NULL,
    verifications_left integer DEFAULT 0 NOT NULL
);


--
-- Name: Subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Subscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Subscription_id_seq" OWNED BY public."Subscription".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    full_name text,
    email text NOT NULL,
    password text NOT NULL,
    mobile text,
    dob timestamp(3) without time zone,
    gender public."Gender",
    "position" text,
    verifier_email text,
    is_verified boolean DEFAULT false,
    company_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    summary text DEFAULT ''::text,
    is_address_verified boolean DEFAULT false NOT NULL,
    is_bank_verified boolean DEFAULT false NOT NULL,
    is_pf_verified boolean DEFAULT false NOT NULL,
    uan text,
    verified_account_name text,
    verified_address jsonb
);


--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserRole" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    company_id integer,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserRole_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserRole_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserRole_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserRole_id_seq" OWNED BY public."UserRole".id;


--
-- Name: UserWorkflowProgress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserWorkflowProgress" (
    id integer NOT NULL,
    status text NOT NULL,
    started_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp(3) without time zone,
    user_id integer NOT NULL,
    workflow_id integer NOT NULL,
    current_node_id text NOT NULL
);


--
-- Name: UserWorkflowProgress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserWorkflowProgress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserWorkflowProgress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserWorkflowProgress_id_seq" OWNED BY public."UserWorkflowProgress".id;


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: VerificationLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationLog" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    verification_type public."VerificationType" NOT NULL,
    outcome public."VerificationOutcome" DEFAULT 'PENDING'::public."VerificationOutcome" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    provider text,
    provider_ref_id text,
    failure_reason text
);


--
-- Name: VerificationLog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."VerificationLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: VerificationLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."VerificationLog_id_seq" OWNED BY public."VerificationLog".id;


--
-- Name: WorkExperience; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkExperience" (
    id integer NOT NULL,
    role text NOT NULL,
    company_name text NOT NULL,
    employee_id text,
    work_type public."WorkType" NOT NULL,
    location text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    currently_working boolean DEFAULT false NOT NULL,
    description text,
    user_id integer NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    verifier_email text DEFAULT ''::text,
    hr_comment text,
    verified_at timestamp(3) without time zone,
    verified_by text,
    mail_sent boolean DEFAULT false NOT NULL,
    job_title text DEFAULT ''::text,
    ver_relation public."Relation" DEFAULT 'same_team'::public."Relation" NOT NULL,
    apollo_used boolean DEFAULT false NOT NULL,
    chat_finished boolean DEFAULT false NOT NULL,
    chat_started boolean DEFAULT false NOT NULL,
    progress public."Progress" DEFAULT 'Beginning'::public."Progress" NOT NULL,
    verifier_number text DEFAULT '+918102244713'::text
);


--
-- Name: WorkExperienceSkill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkExperienceSkill" (
    work_experience_id integer NOT NULL,
    skill_id integer NOT NULL,
    verification_status public."VerificationStatus" DEFAULT 'UNVERIFIED'::public."VerificationStatus" NOT NULL
);


--
-- Name: WorkExperienceWorkflowProgress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkExperienceWorkflowProgress" (
    id integer NOT NULL,
    status text NOT NULL,
    started_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp(3) without time zone,
    work_experience_id integer NOT NULL,
    workflow_id integer NOT NULL,
    current_node_id text NOT NULL
);


--
-- Name: WorkExperienceWorkflowProgress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."WorkExperienceWorkflowProgress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkExperienceWorkflowProgress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."WorkExperienceWorkflowProgress_id_seq" OWNED BY public."WorkExperienceWorkflowProgress".id;


--
-- Name: WorkExperience_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."WorkExperience_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkExperience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."WorkExperience_id_seq" OWNED BY public."WorkExperience".id;


--
-- Name: Workflow; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Workflow" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    company_id integer NOT NULL
);


--
-- Name: WorkflowEdge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkflowEdge" (
    id text NOT NULL,
    condition public."EdgeCondition" DEFAULT 'ALWAYS'::public."EdgeCondition" NOT NULL,
    source_node_id text NOT NULL,
    target_node_id text NOT NULL,
    workflow_id integer NOT NULL
);


--
-- Name: WorkflowNode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkflowNode" (
    id text NOT NULL,
    type public."WorkflowNodeType" NOT NULL,
    position_x integer NOT NULL,
    position_y integer NOT NULL,
    config jsonb NOT NULL,
    workflow_id integer NOT NULL
);


--
-- Name: Workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Workflow_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Workflow_id_seq" OWNED BY public."Workflow".id;


--
-- Name: Campaign id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign" ALTER COLUMN id SET DEFAULT nextval('public."Campaign_id_seq"'::regclass);


--
-- Name: Company id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Company" ALTER COLUMN id SET DEFAULT nextval('public."Company_id_seq"'::regclass);


--
-- Name: Education id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Education" ALTER COLUMN id SET DEFAULT nextval('public."Education_id_seq"'::regclass);


--
-- Name: EmailTemplate id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplate" ALTER COLUMN id SET DEFAULT nextval('public."EmailTemplate_id_seq"'::regclass);


--
-- Name: Feature id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Feature" ALTER COLUMN id SET DEFAULT nextval('public."Feature_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: Plan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Plan" ALTER COLUMN id SET DEFAULT nextval('public."Plan_id_seq"'::regclass);


--
-- Name: PlanFeature id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlanFeature" ALTER COLUMN id SET DEFAULT nextval('public."PlanFeature_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


--
-- Name: RolePermission id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission" ALTER COLUMN id SET DEFAULT nextval('public."RolePermission_id_seq"'::regclass);


--
-- Name: Skill id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Skill" ALTER COLUMN id SET DEFAULT nextval('public."Skill_id_seq"'::regclass);


--
-- Name: Subscription id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription" ALTER COLUMN id SET DEFAULT nextval('public."Subscription_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: UserRole id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole" ALTER COLUMN id SET DEFAULT nextval('public."UserRole_id_seq"'::regclass);


--
-- Name: UserWorkflowProgress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserWorkflowProgress" ALTER COLUMN id SET DEFAULT nextval('public."UserWorkflowProgress_id_seq"'::regclass);


--
-- Name: VerificationLog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationLog" ALTER COLUMN id SET DEFAULT nextval('public."VerificationLog_id_seq"'::regclass);


--
-- Name: WorkExperience id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperience" ALTER COLUMN id SET DEFAULT nextval('public."WorkExperience_id_seq"'::regclass);


--
-- Name: WorkExperienceWorkflowProgress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceWorkflowProgress" ALTER COLUMN id SET DEFAULT nextval('public."WorkExperienceWorkflowProgress_id_seq"'::regclass);


--
-- Name: Workflow id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Workflow" ALTER COLUMN id SET DEFAULT nextval('public."Workflow_id_seq"'::regclass);


--
-- Name: CampaignUser CampaignUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignUser"
    ADD CONSTRAINT "CampaignUser_pkey" PRIMARY KEY (user_id, campaign_id);


--
-- Name: Campaign Campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Education Education_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplate EmailTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Feature Feature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Feature"
    ADD CONSTRAINT "Feature_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PlanFeature PlanFeature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlanFeature"
    ADD CONSTRAINT "PlanFeature_pkey" PRIMARY KEY (id);


--
-- Name: Plan Plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Plan"
    ADD CONSTRAINT "Plan_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Skill Skill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Skill"
    ADD CONSTRAINT "Skill_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: UserWorkflowProgress UserWorkflowProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserWorkflowProgress"
    ADD CONSTRAINT "UserWorkflowProgress_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationLog VerificationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationLog"
    ADD CONSTRAINT "VerificationLog_pkey" PRIMARY KEY (id);


--
-- Name: WorkExperienceSkill WorkExperienceSkill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceSkill"
    ADD CONSTRAINT "WorkExperienceSkill_pkey" PRIMARY KEY (work_experience_id, skill_id);


--
-- Name: WorkExperienceWorkflowProgress WorkExperienceWorkflowProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceWorkflowProgress"
    ADD CONSTRAINT "WorkExperienceWorkflowProgress_pkey" PRIMARY KEY (id);


--
-- Name: WorkExperience WorkExperience_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperience"
    ADD CONSTRAINT "WorkExperience_pkey" PRIMARY KEY (id);


--
-- Name: WorkflowEdge WorkflowEdge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkflowEdge"
    ADD CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY (id);


--
-- Name: WorkflowNode WorkflowNode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkflowNode"
    ADD CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY (id);


--
-- Name: Workflow Workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Workflow"
    ADD CONSTRAINT "Workflow_pkey" PRIMARY KEY (id);


--
-- Name: Company_admin_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Company_admin_id_key" ON public."Company" USING btree (admin_id);


--
-- Name: Company_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Company_name_key" ON public."Company" USING btree (name);


--
-- Name: EmailTemplate_company_id_type_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EmailTemplate_company_id_type_key" ON public."EmailTemplate" USING btree (company_id, type);


--
-- Name: Feature_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Feature_name_key" ON public."Feature" USING btree (name);


--
-- Name: PlanFeature_plan_id_feature_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PlanFeature_plan_id_feature_id_key" ON public."PlanFeature" USING btree (plan_id, feature_id);


--
-- Name: Plan_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Plan_name_key" ON public."Plan" USING btree (name);


--
-- Name: RolePermission_role_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RolePermission_role_name_key" ON public."RolePermission" USING btree (role_name);


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: Skill_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Skill_name_key" ON public."Skill" USING btree (name);


--
-- Name: Subscription_company_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Subscription_company_id_key" ON public."Subscription" USING btree (company_id);


--
-- Name: UserRole_user_id_role_id_company_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserRole_user_id_role_id_company_id_key" ON public."UserRole" USING btree (user_id, role_id, company_id);


--
-- Name: UserWorkflowProgress_user_id_workflow_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserWorkflowProgress_user_id_workflow_id_key" ON public."UserWorkflowProgress" USING btree (user_id, workflow_id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_mobile_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_mobile_key" ON public."User" USING btree (mobile);


--
-- Name: User_uan_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_uan_key" ON public."User" USING btree (uan);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: VerificationLog_provider_ref_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationLog_provider_ref_id_key" ON public."VerificationLog" USING btree (provider_ref_id);


--
-- Name: VerificationLog_user_id_verification_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VerificationLog_user_id_verification_type_idx" ON public."VerificationLog" USING btree (user_id, verification_type);


--
-- Name: WorkExperienceWorkflowProgress_work_experience_id_workflow__key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WorkExperienceWorkflowProgress_work_experience_id_workflow__key" ON public."WorkExperienceWorkflowProgress" USING btree (work_experience_id, workflow_id);


--
-- Name: WorkflowEdge_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WorkflowEdge_id_key" ON public."WorkflowEdge" USING btree (id);


--
-- Name: WorkflowEdge_workflow_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkflowEdge_workflow_id_idx" ON public."WorkflowEdge" USING btree (workflow_id);


--
-- Name: WorkflowNode_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WorkflowNode_id_key" ON public."WorkflowNode" USING btree (id);


--
-- Name: CampaignUser CampaignUser_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignUser"
    ADD CONSTRAINT "CampaignUser_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public."Campaign"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignUser CampaignUser_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignUser"
    ADD CONSTRAINT "CampaignUser_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Campaign Campaign_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaign"
    ADD CONSTRAINT "Campaign_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Company Company_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Education Education_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmailTemplate EmailTemplate_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PlanFeature PlanFeature_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlanFeature"
    ADD CONSTRAINT "PlanFeature_feature_id_fkey" FOREIGN KEY (feature_id) REFERENCES public."Feature"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PlanFeature PlanFeature_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlanFeature"
    ADD CONSTRAINT "PlanFeature_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subscription Subscription_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWorkflowProgress UserWorkflowProgress_current_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserWorkflowProgress"
    ADD CONSTRAINT "UserWorkflowProgress_current_node_id_fkey" FOREIGN KEY (current_node_id) REFERENCES public."WorkflowNode"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserWorkflowProgress UserWorkflowProgress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserWorkflowProgress"
    ADD CONSTRAINT "UserWorkflowProgress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserWorkflowProgress UserWorkflowProgress_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserWorkflowProgress"
    ADD CONSTRAINT "UserWorkflowProgress_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VerificationLog VerificationLog_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VerificationLog"
    ADD CONSTRAINT "VerificationLog_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkExperienceSkill WorkExperienceSkill_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceSkill"
    ADD CONSTRAINT "WorkExperienceSkill_skill_id_fkey" FOREIGN KEY (skill_id) REFERENCES public."Skill"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkExperienceSkill WorkExperienceSkill_work_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceSkill"
    ADD CONSTRAINT "WorkExperienceSkill_work_experience_id_fkey" FOREIGN KEY (work_experience_id) REFERENCES public."WorkExperience"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkExperienceWorkflowProgress WorkExperienceWorkflowProgress_current_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceWorkflowProgress"
    ADD CONSTRAINT "WorkExperienceWorkflowProgress_current_node_id_fkey" FOREIGN KEY (current_node_id) REFERENCES public."WorkflowNode"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkExperienceWorkflowProgress WorkExperienceWorkflowProgress_work_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceWorkflowProgress"
    ADD CONSTRAINT "WorkExperienceWorkflowProgress_work_experience_id_fkey" FOREIGN KEY (work_experience_id) REFERENCES public."WorkExperience"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkExperienceWorkflowProgress WorkExperienceWorkflowProgress_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperienceWorkflowProgress"
    ADD CONSTRAINT "WorkExperienceWorkflowProgress_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkExperience WorkExperience_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkExperience"
    ADD CONSTRAINT "WorkExperience_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkflowEdge WorkflowEdge_source_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkflowEdge"
    ADD CONSTRAINT "WorkflowEdge_source_node_id_fkey" FOREIGN KEY (source_node_id) REFERENCES public."WorkflowNode"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkflowEdge WorkflowEdge_target_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkflowEdge"
    ADD CONSTRAINT "WorkflowEdge_target_node_id_fkey" FOREIGN KEY (target_node_id) REFERENCES public."WorkflowNode"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkflowEdge WorkflowEdge_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkflowEdge"
    ADD CONSTRAINT "WorkflowEdge_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkflowNode WorkflowNode_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkflowNode"
    ADD CONSTRAINT "WorkflowNode_workflow_id_fkey" FOREIGN KEY (workflow_id) REFERENCES public."Workflow"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Workflow Workflow_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Workflow"
    ADD CONSTRAINT "Workflow_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

