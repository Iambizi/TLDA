import type {
  ApplicationStatus,
  AttendanceStatus,
  EventStatus,
  InterestStatus,
  InterviewOutcome,
  LifestylePreference,
  ReadinessForLove,
} from '@/types'

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  interview_requested: 'Interview Requested',
  interviewed: 'Interviewed',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  declined: 'Declined',
  assigned_to_event: 'Assigned to Event',
  attended: 'Attended',
  archived: 'Archived',
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  interview_requested: 'bg-purple-100 text-purple-800',
  interviewed: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  waitlisted: 'bg-orange-100 text-orange-800',
  declined: 'bg-red-100 text-red-800',
  assigned_to_event: 'bg-teal-100 text-teal-800',
  attended: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-gray-100 text-gray-500',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  completed: 'Completed',
  archived: 'Archived',
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  invited: 'Invited',
  confirmed: 'Confirmed',
  waitlisted: 'Waitlisted',
  attended: 'Attended',
  no_show: 'No Show',
  cancelled: 'Cancelled',
}

export const INTERVIEW_OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  pending: 'Pending',
  completed: 'Completed',
  no_show: 'No Show',
  follow_up_needed: 'Follow-up Needed',
}

export const INTEREST_STATUS_LABELS: Record<InterestStatus, string> = {
  potential_match: 'Potential Match',
  one_sided_interest: 'One-sided Interest',
  mutual_interest: 'Mutual Interest',
  no_match: 'No Match',
  follow_up_needed: 'Follow-up Needed',
  introduced_off_platform: 'Introduced Off Platform',
}

export const READINESS_LABELS: Record<ReadinessForLove, string> = {
  yes: 'Yes, ready',
  not_sure: 'Not sure yet',
  no: 'Not right now',
}

export const LIFESTYLE_PREFERENCE_LABELS: Record<LifestylePreference, string> = {
  want: 'Want',
  dont_want: "Don't Want",
  flexible: 'Flexible',
}

export const SELF_LIFESTYLE_LABELS: Record<LifestylePreference, string> = {
  want: 'Yes',
  dont_want: 'No',
  flexible: 'Sometimes',
}

export const LIFESTYLE_ATTRIBUTES = [
  { self: 'has_kids', partner: 'partner_has_kids', label: 'Has Kids', isBinary: true },
  { self: 'travels_world', partner: 'partner_travels_world', label: 'Travels the World' },
  { self: 'is_divorced', partner: 'partner_is_divorced', label: 'Divorced', isBinary: true },
  {
    self: 'smokes_drug_friendly',
    partner: 'partner_smokes_drug_friendly',
    label: 'Smoke / Drug Friendly',
  },
  { self: 'has_tattoos', partner: 'partner_has_tattoos', label: 'Has Tattoos', isBinary: true },
  { self: 'fitness_level', partner: 'partner_fitness', label: 'Fitness Focused' },
  { self: 'close_with_family', partner: 'partner_close_with_family', label: 'Close with Family' },
] as const

export const DEFAULT_PRIORITY_WEIGHTS = {
  pedigree: 34,
  looks: 33,
  personality: 33,
}
