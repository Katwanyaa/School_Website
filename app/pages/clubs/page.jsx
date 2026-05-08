'use client';

import PublicSchoolHubPage from '../../components/schoolhub/public-page';

export default function ClubsSocietiesPage() {
  return (
    <PublicSchoolHubPage
      title="Clubs & Societies"
      eyebrow="Katwanyaa School Hub"
      description="Explore Katwanyaa Senior School's student communities, talent groups, academic societies, service teams, and co-curricular spaces managed through the School Hub."
      sections={[
        { title: 'Clubs', type: 'CLUB' },
        { title: 'Societies', type: 'SOCIETY' },
      ]}
      emptyText="No clubs or societies have been published yet."
    />
  );
}
