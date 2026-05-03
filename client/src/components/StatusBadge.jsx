const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const labels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export default StatusBadge;
