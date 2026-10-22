import { useMemo, useState } from 'react';

import { userActivityRepository } from 'src/repositories';

/**
 * @typedef {import("src/repositories/userActivity").UserActivity} UserActivity
 */

export const useUserActivityState = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  /** @type {[UserActivity[], void]} */
  const [activities, setActivities] = useState([]);

  const activitiesPage = useMemo(() => {
    const start = page * limit;
    const until = start + limit;
    return activities.slice(start, until);
  });

  function reset() {
    setPage(0);
    setLimit(10);
    setActivities([]);
  }

  async function fetchActivities({ user_id, start, until }) {
    const result = await userActivityRepository.getList({
      user: user_id,
      start,
      until,
    });
    setActivities(result);
    setPage(0);
    setLimit(10);
  }

  return {
    activities,
    setActivities,
    page,
    setPage,
    limit,
    setLimit,
    fetchActivities,
    reset,
    activitiesPage,
  };
};
