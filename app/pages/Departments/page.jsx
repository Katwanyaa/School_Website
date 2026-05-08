'use client';

import PublicSchoolHubPage from '../../components/schoolhub/public-page';

export default function DepartmentsPage() {
  return (
    <PublicSchoolHubPage
      title="Departments"
      eyebrow="Staff Departments"
      departments
      description="A privacy-first department directory for Katwanyaa Senior School, showing department-level information without exposing individual teacher profiles."
      emptyText="No departments have been published yet."
    />
  );
}
