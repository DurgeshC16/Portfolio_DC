// Recorded insertion batches for three single-key binary search trees.
// Random uses a fresh seed of 42 per dataset and may repeat keys; sorted
// and reverse-sorted inputs contain each integer from 1 through N once.
// height is the final number of levels. batchMs times all N insert calls
// together, excluding input generation and the final height measurement.
// Each configuration has one recorded timing, without repeated trials.
const treeBenchmarks = {
  revision: 'b80db89f864a8dfa09558a4292f029df4fc537c1',
  source: 'https://github.com/DurgeshC16/DS_Actual_CP/blob/b80db89f864a8dfa09558a4292f029df4fc537c1/dashboard/metrics.json',
  method: 'https://github.com/DurgeshC16/DS_Actual_CP/blob/b80db89f864a8dfa09558a4292f029df4fc537c1/src/BenchmarkRunner.cpp#L32-L55',
  generator: 'https://github.com/DurgeshC16/DS_Actual_CP/blob/b80db89f864a8dfa09558a4292f029df4fc537c1/src/DatasetGenerator.cpp#L29-L47',
  trees: ['AVL', 'Red-Black', 'Splay'],
  workloads: ['Random', 'Sorted', 'Reverse Sorted'],
  sizes: [1000, 5000, 10000],
  records: [
    { tree: 'AVL', workload: 'Random', size: 1000, height: 12, batchMs: 0.1114 },
    { tree: 'Red-Black', workload: 'Random', size: 1000, height: 13, batchMs: 0.0833 },
    { tree: 'Splay', workload: 'Random', size: 1000, height: 23, batchMs: 0.1485 },
    { tree: 'AVL', workload: 'Sorted', size: 1000, height: 10, batchMs: 0.0567 },
    { tree: 'Red-Black', workload: 'Sorted', size: 1000, height: 17, batchMs: 0.057 },
    { tree: 'Splay', workload: 'Sorted', size: 1000, height: 1000, batchMs: 0.0318 },
    { tree: 'AVL', workload: 'Reverse Sorted', size: 1000, height: 10, batchMs: 0.0602 },
    { tree: 'Red-Black', workload: 'Reverse Sorted', size: 1000, height: 17, batchMs: 0.0559 },
    { tree: 'Splay', workload: 'Reverse Sorted', size: 1000, height: 1000, batchMs: 0.0309 },
    { tree: 'AVL', workload: 'Random', size: 5000, height: 15, batchMs: 0.6143 },
    { tree: 'Red-Black', workload: 'Random', size: 5000, height: 15, batchMs: 0.537 },
    { tree: 'Splay', workload: 'Random', size: 5000, height: 30, batchMs: 0.9161 },
    { tree: 'AVL', workload: 'Sorted', size: 5000, height: 13, batchMs: 0.3897 },
    { tree: 'Red-Black', workload: 'Sorted', size: 5000, height: 22, batchMs: 0.3577 },
    { tree: 'Splay', workload: 'Sorted', size: 5000, height: 5000, batchMs: 0.2746 },
    { tree: 'AVL', workload: 'Reverse Sorted', size: 5000, height: 13, batchMs: 0.3692 },
    { tree: 'Red-Black', workload: 'Reverse Sorted', size: 5000, height: 22, batchMs: 0.3407 },
    { tree: 'Splay', workload: 'Reverse Sorted', size: 5000, height: 5000, batchMs: 0.1512 },
    { tree: 'AVL', workload: 'Random', size: 10000, height: 16, batchMs: 1.4578 },
    { tree: 'Red-Black', workload: 'Random', size: 10000, height: 16, batchMs: 1.1624 },
    { tree: 'Splay', workload: 'Random', size: 10000, height: 29, batchMs: 2.3441 },
    { tree: 'AVL', workload: 'Sorted', size: 10000, height: 14, batchMs: 0.7602 },
    { tree: 'Red-Black', workload: 'Sorted', size: 10000, height: 24, batchMs: 0.8809 },
    { tree: 'Splay', workload: 'Sorted', size: 10000, height: 10000, batchMs: 0.3674 },
    { tree: 'AVL', workload: 'Reverse Sorted', size: 10000, height: 14, batchMs: 0.9096 },
    { tree: 'Red-Black', workload: 'Reverse Sorted', size: 10000, height: 24, batchMs: 0.7742 },
    { tree: 'Splay', workload: 'Reverse Sorted', size: 10000, height: 10000, batchMs: 0.3649 },
  ],
};
