'use client';

import PublicSchoolHubPage from '../../components/schoolhub/public-page';

export default function BoardingPage() {
  return (
    <PublicSchoolHubPage
      title="Boarding"
      eyebrow="Student Life"
      singleType="BOARDING"
      description="A clean view of Katwanyaa Senior School boarding life, facilities, routines, care systems, and student support information from the School Hub."
      emptyText="Boarding information has not been published yet."
    />
  );
}
