'use client';

import PublicSchoolHubPage from '../../components/schoolhub/public-page';

export default function StudentCouncilPage() {
  return (
    <PublicSchoolHubPage
      title="Student Council"
      eyebrow="Student Leadership"
      singleType="STUDENT_COUNCIL"
      description="Meet the published student leadership structures, council roles, projects, and representation updates for Katwanyaa Senior School."
      emptyText="Student council information has not been published yet."
    />
  );
}
