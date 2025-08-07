// 'use client';
// import React from 'react';
// import styles from './UserProfile.module.css'; // Reusing the same CSS module
// import { FiCheckCircle } from 'react-icons/fi';
// import { Radar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   RadialLinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Tooltip,
// } from 'chart.js';

// // Register the necessary components for the radar chart
// ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// /**
//  * A sub-component for a single skill card.
//  */
// const SkillCard = ({ icon, name, endorsements, isVerified }) => (
//   <div className={styles.skillCard}>
//     <div className={styles.skillIconWrapper}>{icon}</div>
//     <div className={styles.skillInfo}>
//       <span className={styles.skillName}>
//         {name}
//         {isVerified && <FiCheckCircle className={styles.verifiedIconSmall} />}
//       </span>
//       <span className={styles.skillEndorsements}>{endorsements} Endorsement{endorsements !== 1 && 's'}</span>
//     </div>
//   </div>
// );

// /**
//  * A sub-component for the skill badges and radar chart.
//  */
// const SkillBadges = ({ roleBasedCount, interestBasedCount }) => {
//   // Data and options for the radar chart
//   const chartData = {
//     labels: ['Business', 'Marketing', 'Finance', 'Development', 'Design', 'Sales'],
//     datasets: [
//       {
//         label: 'Skill Level',
//         data: [4, 5, 3, 5, 4, 3], // Example data points
//         backgroundColor: 'rgba(43, 102, 246, 0.2)',
//         borderColor: 'rgba(43, 102, 246, 1)',
//         borderWidth: 2,
//         pointBackgroundColor: 'rgba(43, 102, 246, 1)',
//         pointBorderColor: '#fff',
//       },
//     ],
//   };

//   const chartOptions = {
//     scales: {
//       r: {
//         angleLines: { color: '#eee' },
//         grid: { color: '#eee' },
//         pointLabels: { font: { size: 12, weight: '500' }, color: '#555' },
//         ticks: { display: false, beginAtZero: true, max: 5 },
//       },
//     },
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: false }
//     },
//     maintainAspectRatio: false,
//   };

//   return (
//     <aside className={styles.skillBadgesContainer}>
//       <h4>Skill Badges</h4>
//       <div className={styles.badgesWrapper}>
//         <div className={styles.badge}>
//           <span className={styles.badgeCount}>{roleBasedCount}</span>
//           <span className={styles.badgeLabel}>Role Based</span>
//         </div>
//         <div className={styles.badge}>
//           <span className={styles.badgeCount}>{interestBasedCount}</span>
//           <span className={styles.badgeLabel}>Interest Based</span>
//         </div>
//       </div>
//       <div className={styles.radarChartContainer}>
//         <Radar data={chartData} options={chartOptions} />
//       </div>
//     </aside>
//   );
// };

// /**
//  * The main component for the "Skill Repository" tab.
//  */
// const SkillRepositorySection = ({ skills }) => {
// const SkillRepositorySection = ({ skills = [] }) => { // <-- FIX IS HERE

//   // Filter skills into categories for display
//   const roleBasedSkills = skills.filter(s => s.skillType === 'ROLE');
//   const interestBasedSkills = skills.filter(s => s.skillType === 'INTEREST');

//   return (
//     <div className={styles.skillRepoLayout}>
//       <div className={styles.skillsListContainer}>
//         {/* Role Based Skills Section */}
//         <section>
//           <div className={styles.contentHeader}>
//             <h3>Role Based Skills</h3>
//             <a href="#" className={styles.seeAllLink}>See all &gt;</a>
//           </div>
//           <p className={styles.sectionDescription}>Skills that you earn for your career.</p>
//           <div className={styles.skillsGrid}>
//             {roleBasedSkills.map(skill => (
//               <SkillCard key={skill.id} {...skill} />
//             ))}
//           </div>
//         </section>

//         {/* Interest Based Skills Section */}
//         <section>
//           <div className={styles.contentHeader}>
//             <h3>Interest Based Skills</h3>
//           </div>
//           <p className={styles.sectionDescription}>Skills that you earn for your will.</p>
//           <div className={styles.skillsGrid}>
//             {interestBasedSkills.map(skill => (
//               <SkillCard key={skill.id} {...skill} />
//             ))}
//           </div>
//         </section>
//       </div>
      
//       {/* Right column for badges and chart */}
//       <SkillBadges roleBasedCount={roleBasedSkills.length} interestBasedCount={interestBasedSkills.length} />
//     </div>
//   );
// }
// };

// export default SkillRepositorySection;

'use client';
import React from 'react';
import Image from 'next/image'; // Import the Next.js Image component
import styles from './UserProfile.module.css';
import { FiCheckCircle } from 'react-icons/fi';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

// Register the necessary components for the radar chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

/**
 * A sub-component for a single skill card.
 * It's now updated to use the 'imageUrl' from the database.
 */
const SkillCard = ({ name, endorsements, isVerified, imageUrl }) => (
  <div className={styles.skillCard}>
    <div className={styles.skillIconWrapper}>
      {/* Use the Image component to display the icon from the URL */}
    <Image
    src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
    alt={`${name} medal icon`}
    width={20}
    height={20}
    />
    </div>
    <div className={styles.skillInfo}>
      <span className={styles.skillName}>
        {name}
        {isVerified && <FiCheckCircle className={styles.verifiedIconSmall} />}
      </span>
      <span className={styles.skillEndorsements}>{endorsements} Endorsement{endorsements !== 1 && 's'}</span>
    </div>
  </div>
);

/**
 * A sub-component for the skill badges and radar chart.
 */
const SkillBadges = ({ roleBasedCount, interestBasedCount }) => {
  // Data and options for the radar chart
  const chartData = {
    labels: ['Business', 'Marketing', 'Finance', 'Development', 'Design', 'Sales'],
    datasets: [
      {
        label: 'Skill Level',
        data: [4, 5, 3, 5, 4, 3], // Example data points
        backgroundColor: 'rgba(43, 102, 246, 0.2)',
        borderColor: 'rgba(43, 102, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(43, 102, 246, 1)',
        pointBorderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: '#eee' },
        grid: { color: '#eee' },
        pointLabels: { font: { size: 12, weight: '500' }, color: '#555' },
        ticks: { display: false, beginAtZero: true, max: 5 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    maintainAspectRatio: false,
  };

  return (
    <aside className={styles.skillBadgesContainer}>
      <h4>Skill Badges</h4>
      <div className={styles.badgesWrapper}>
        <div className={styles.badge}>
          <span className={styles.badgeCount}>{roleBasedCount}</span>
          <span className={styles.badgeLabel}>Role Based</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeCount}>{interestBasedCount}</span>
          <span className={styles.badgeLabel}>Interest Based</span>
        </div>
      </div>
      <div className={styles.radarChartContainer}>
        <Radar data={chartData} options={chartOptions} />
      </div>
    </aside>
  );
};

/**
 * The main component for the "Skill Repository" tab.
 */
const SkillRepositorySection = ({ skills = [] }) => {
  // Filter skills based on the `skillType` enum from your Prisma schema.
  const roleBasedSkills = skills.filter(s => s.skillType === 'ROLE');
  const interestBasedSkills = skills.filter(s => s.skillType === 'INTEREST');

  return (
    <div className={styles.skillRepoLayout}>
      <div className={styles.skillsListContainer}>
        {/* Role Based Skills Section */}
        <section>
          <div className={styles.contentHeader}>
            <h3>Role Based Skills</h3>
            <a href="#" className={styles.seeAllLink}>See all &gt;</a>
          </div>
          <p className={styles.sectionDescription}>Skills that you earn for your career.</p>
          <div className={styles.skillsGrid}>
            {roleBasedSkills.map(skill => (
              <SkillCard key={skill.id} {...skill} />
            ))}
          </div>
        </section>

        {/* Interest Based Skills Section */}
        <section>
          <div className={styles.contentHeader}>
            <h3>Interest Based Skills</h3>
          </div>
          <p className={styles.sectionDescription}>Skills that you earn for your will.</p>
          <div className={styles.skillsGrid}>
            {interestBasedSkills.map(skill => (
              <SkillCard key={skill.id} {...skill} />
            ))}
          </div>
        </section>
      </div>
      
      {/* Right column for badges and chart */}
      <SkillBadges roleBasedCount={roleBasedSkills.length} interestBasedCount={interestBasedSkills.length} />
    </div>
  );
};

export default SkillRepositorySection;