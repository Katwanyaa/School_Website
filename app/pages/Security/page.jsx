'use client';

import PublicSchoolHubPage from '../../components/schoolhub/public-page';

export default function SecurityPage() {
  return (
    <PublicSchoolHubPage
      title="Security"
      eyebrow="Campus Safety"
      singleType="SECURITY"
      description="Published safety routines, campus protection measures, visitor guidance, and student welfare information for Katwanyaa Senior School."
      emptyText="Security information has not been published yet."
    />
  );
}
