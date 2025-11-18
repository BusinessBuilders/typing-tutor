import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type BranchConditionType =
  | 'choice'
  | 'skill-level'
  | 'accuracy-threshold'
  | 'wpm-threshold'
  | 'time-limit'
  | 'previous-choice'
  | 'achievement'
  | 'random';

export type BranchMergeStrategy =
  | 'none' // Branches don't merge
  | 'converge' // All branches eventually lead to same point
  | 'parallel' // Branches run in parallel and can cross-reference
  | 'exclusive'; // Only one branch can be active

export interface BranchCondition {
  id: string;
  type: BranchConditionType;
  description: string;
  parameters: Record<string, any>; // e.g., { minAccuracy: 90, minWPM: 50 }
  required: boolean; // If true, condition must be met to take branch
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  fromNodeId: string;
  toNodeId: string;
  conditions: BranchCondition[];
  priority: number; // Higher priority branches evaluated first
  weight: number; // For random branching, probability weight
  locked: boolean;
  unlockConditions?: BranchCondition[];
  tags: string[];
  metadata?: {
    difficulty?: number;
    recommendedFor?: string[];
    estimatedDuration?: number;
  };
}

export interface BranchNode {
  id: string;
  type: 'start' | 'decision' | 'content' | 'merge' | 'end';
  title: string;
  content?: string;
  characterIds?: string[];
  outgoingBranches: string[]; // Branch IDs
  incomingBranches: string[]; // Branch IDs
  position?: { x: number; y: number }; // For visualization
  visited: boolean;
  metadata?: {
    wordCount?: number;
    estimatedTime?: number;
  };
}

export interface BranchingTree {
  id: string;
  name: string;
  description: string;
  nodes: Map<string, BranchNode>;
  branches: Map<string, Branch>;
  startNodeId: string;
  endNodeIds: string[];
  mergeStrategy: BranchMergeStrategy;
  tags: string[];
  autismFriendly: boolean;
  created: Date;
  lastModified: Date;
}

export interface BranchingPath {
  id: string;
  treeId: string;
  nodes: string[]; // Ordered list of visited node IDs
  branches: string[]; // Ordered list of taken branch IDs
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  choicesMade: { nodeId: string; branchId: string; timestamp: Date }[];
  conditionResults: { branchId: string; conditionId: string; met: boolean }[];
}

export interface BranchingAnalytics {
  treeId: string;
  totalPaths: number;
  completedPaths: number;
  mostTakenBranch: string;
  leastTakenBranch: string;
  averagePathLength: number;
  branchTakeCounts: Map<string, number>;
  nodeVisitCounts: Map<string, number>;
  popularPaths: { nodes: string[]; count: number }[];
}

export interface BranchingSystemSettings {
  visualizeBranches: boolean;
  showBranchPreview: boolean;
  highlightAvailableBranches: boolean;
  showConditions: boolean;
  allowBacktracking: boolean;
  saveProgress: boolean;
  showAnalytics: boolean;
  autoSelectOnSingleBranch: boolean;
}

interface BranchingSystemProps {
  onBranchTaken?: (branch: Branch, fromNode: BranchNode, toNode: BranchNode) => void;
  onPathComplete?: (path: BranchingPath) => void;
  onConditionEvaluated?: (condition: BranchCondition, met: boolean) => void;
  settings?: Partial<BranchingSystemSettings>;
}

// Sample branching tree
function createSampleBranchingTree(): BranchingTree {
  const nodes = new Map<string, BranchNode>();
  const branches = new Map<string, Branch>();

  // Create nodes
  const startNode: BranchNode = {
    id: 'node-start',
    type: 'start',
    title: 'The Crossroads',
    content: 'You stand at a crossroads. Three paths lie before you, each leading to a different adventure.',
    outgoingBranches: ['branch-forest', 'branch-mountain', 'branch-city'],
    incomingBranches: [],
    visited: false,
    position: { x: 400, y: 50 },
    metadata: { wordCount: 20, estimatedTime: 12 },
  };

  const forestNode: BranchNode = {
    id: 'node-forest',
    type: 'content',
    title: 'The Enchanted Forest',
    content: 'Tall trees surround you, their leaves whispering ancient secrets. A friendly fox appears, offering to guide you.',
    outgoingBranches: ['branch-follow-fox', 'branch-explore-alone'],
    incomingBranches: ['branch-forest'],
    visited: false,
    position: { x: 200, y: 200 },
    metadata: { wordCount: 25, estimatedTime: 15 },
  };

  const mountainNode: BranchNode = {
    id: 'node-mountain',
    type: 'content',
    title: 'The Misty Mountain',
    content: 'The mountain path is steep but beautiful. You notice a cave entrance and hear melodic sounds from within.',
    outgoingBranches: ['branch-enter-cave', 'branch-continue-climb'],
    incomingBranches: ['branch-mountain'],
    visited: false,
    position: { x: 400, y: 200 },
    metadata: { wordCount: 22, estimatedTime: 13 },
  };

  const cityNode: BranchNode = {
    id: 'node-city',
    type: 'content',
    title: 'The Bustling City',
    content: 'Colorful buildings line the streets. A friendly robot approaches, asking if you need assistance.',
    outgoingBranches: ['branch-accept-help', 'branch-explore-independently'],
    incomingBranches: ['branch-city'],
    visited: false,
    position: { x: 600, y: 200 },
    metadata: { wordCount: 20, estimatedTime: 12 },
  };

  const endNode: BranchNode = {
    id: 'node-end',
    type: 'end',
    title: 'Journey Complete',
    content: 'Your adventure comes to a satisfying end. You have learned much and made wonderful memories.',
    outgoingBranches: [],
    incomingBranches: ['branch-to-end-1', 'branch-to-end-2', 'branch-to-end-3'],
    visited: false,
    position: { x: 400, y: 400 },
    metadata: { wordCount: 18, estimatedTime: 11 },
  };

  nodes.set(startNode.id, startNode);
  nodes.set(forestNode.id, forestNode);
  nodes.set(mountainNode.id, mountainNode);
  nodes.set(cityNode.id, cityNode);
  nodes.set(endNode.id, endNode);

  // Create branches from start
  const forestBranch: Branch = {
    id: 'branch-forest',
    name: 'Forest Path',
    description: 'Take the path through the enchanted forest',
    fromNodeId: 'node-start',
    toNodeId: 'node-forest',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['nature', 'easy'],
    metadata: { difficulty: 3, recommendedFor: ['beginners'], estimatedDuration: 30 },
  };

  const mountainBranch: Branch = {
    id: 'branch-mountain',
    name: 'Mountain Path',
    description: 'Climb the misty mountain',
    fromNodeId: 'node-start',
    toNodeId: 'node-mountain',
    conditions: [
      {
        id: 'cond-wpm-40',
        type: 'wpm-threshold',
        description: 'Type at least 40 WPM',
        parameters: { minWPM: 40 },
        required: false,
      },
    ],
    priority: 2,
    weight: 1,
    locked: false,
    tags: ['adventure', 'medium'],
    metadata: { difficulty: 5, recommendedFor: ['intermediate'], estimatedDuration: 45 },
  };

  const cityBranch: Branch = {
    id: 'branch-city',
    name: 'City Path',
    description: 'Explore the bustling city',
    fromNodeId: 'node-start',
    toNodeId: 'node-city',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['urban', 'easy'],
    metadata: { difficulty: 3, recommendedFor: ['all'], estimatedDuration: 35 },
  };

  // Branches from forest
  const followFoxBranch: Branch = {
    id: 'branch-follow-fox',
    name: 'Follow the Fox',
    description: 'Trust the friendly fox to guide you',
    fromNodeId: 'node-forest',
    toNodeId: 'node-end',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['trust', 'friendship'],
  };

  const exploreAloneBranch: Branch = {
    id: 'branch-explore-alone',
    name: 'Explore Alone',
    description: 'Venture deeper into the forest independently',
    fromNodeId: 'node-forest',
    toNodeId: 'node-end',
    conditions: [
      {
        id: 'cond-accuracy-85',
        type: 'accuracy-threshold',
        description: 'Type with 85% accuracy or higher',
        parameters: { minAccuracy: 85 },
        required: true,
      },
    ],
    priority: 2,
    weight: 1,
    locked: false,
    tags: ['independence', 'challenge'],
  };

  // Branches from mountain
  const enterCaveBranch: Branch = {
    id: 'branch-enter-cave',
    name: 'Enter the Cave',
    description: 'Investigate the mysterious sounds',
    fromNodeId: 'node-mountain',
    toNodeId: 'node-end',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['mystery', 'exploration'],
  };

  const continuClimbBranch: Branch = {
    id: 'branch-continue-climb',
    name: 'Continue Climbing',
    description: 'Push forward to the mountain peak',
    fromNodeId: 'node-mountain',
    toNodeId: 'node-end',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['perseverance', 'achievement'],
  };

  // Branches from city
  const acceptHelpBranch: Branch = {
    id: 'branch-accept-help',
    name: 'Accept Help',
    description: 'Let the robot guide you through the city',
    fromNodeId: 'node-city',
    toNodeId: 'node-end',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['cooperation', 'assistance'],
  };

  const exploreIndependentlyBranch: Branch = {
    id: 'branch-explore-independently',
    name: 'Explore Independently',
    description: 'Discover the city on your own terms',
    fromNodeId: 'node-city',
    toNodeId: 'node-end',
    conditions: [],
    priority: 1,
    weight: 1,
    locked: false,
    tags: ['independence', 'discovery'],
  };

  branches.set(forestBranch.id, forestBranch);
  branches.set(mountainBranch.id, mountainBranch);
  branches.set(cityBranch.id, cityBranch);
  branches.set(followFoxBranch.id, followFoxBranch);
  branches.set(exploreAloneBranch.id, exploreAloneBranch);
  branches.set(enterCaveBranch.id, enterCaveBranch);
  branches.set(continuClimbBranch.id, continuClimbBranch);
  branches.set(acceptHelpBranch.id, acceptHelpBranch);
  branches.set(exploreIndependentlyBranch.id, exploreIndependentlyBranch);

  return {
    id: 'tree-sample',
    name: 'The Adventure Begins',
    description: 'A branching adventure with multiple paths and endings',
    nodes,
    branches,
    startNodeId: 'node-start',
    endNodeIds: ['node-end'],
    mergeStrategy: 'converge',
    tags: ['adventure', 'branching', 'beginner-friendly'],
    autismFriendly: true,
    created: new Date(),
    lastModified: new Date(),
  };
}

const defaultSettings: BranchingSystemSettings = {
  visualizeBranches: true,
  showBranchPreview: true,
  highlightAvailableBranches: true,
  showConditions: true,
  allowBacktracking: false,
  saveProgress: true,
  showAnalytics: false,
  autoSelectOnSingleBranch: false,
};

export const useBranchingSystem = (props: BranchingSystemProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [trees, setTrees] = useState<BranchingTree[]>([]);
  const [currentTree, setCurrentTree] = useState<BranchingTree | null>(null);
  const [currentNode, setCurrentNode] = useState<BranchNode | null>(null);
  const [currentPath, setCurrentPath] = useState<BranchingPath | null>(null);
  const [allPaths, setAllPaths] = useState<BranchingPath[]>([]);
  const [analytics, setAnalytics] = useState<Map<string, BranchingAnalytics>>(new Map());

  // User context for condition evaluation
  const [userContext, setUserContext] = useState({
    currentWPM: 0,
    currentAccuracy: 100,
    skillLevel: 1,
    achievements: [] as string[],
    previousChoices: [] as string[],
  });

  // Initialize with sample tree
  useEffect(() => {
    const sampleTree = createSampleBranchingTree();
    setTrees([sampleTree]);

    // Load paths from localStorage
    try {
      const saved = localStorage.getItem('typing-tutor-branching-paths');
      if (saved) {
        const data = JSON.parse(saved);
        setAllPaths(data.paths || []);
      }
    } catch (err) {
      console.error('Failed to load branching paths:', err);
    }
  }, []);

  // Auto-save paths
  useEffect(() => {
    if (!settings.saveProgress) return;

    try {
      const data = { paths: allPaths.slice(-50) }; // Keep last 50 paths
      localStorage.setItem('typing-tutor-branching-paths', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save branching paths:', err);
    }
  }, [allPaths, settings.saveProgress]);

  // Evaluate branch condition
  const evaluateCondition = useCallback(
    (condition: BranchCondition): boolean => {
      let met = false;

      switch (condition.type) {
        case 'choice':
          met = true; // User makes choice explicitly
          break;
        case 'skill-level':
          met = userContext.skillLevel >= (condition.parameters.minLevel || 1);
          break;
        case 'accuracy-threshold':
          met = userContext.currentAccuracy >= (condition.parameters.minAccuracy || 0);
          break;
        case 'wpm-threshold':
          met = userContext.currentWPM >= (condition.parameters.minWPM || 0);
          break;
        case 'achievement':
          met = userContext.achievements.includes(condition.parameters.achievementId);
          break;
        case 'previous-choice':
          met = userContext.previousChoices.includes(condition.parameters.choiceId);
          break;
        case 'random':
          met = Math.random() < (condition.parameters.probability || 0.5);
          break;
        default:
          met = true;
      }

      props.onConditionEvaluated?.(condition, met);
      return met;
    },
    [userContext, props]
  );

  // Get available branches from current node
  const getAvailableBranches = useCallback((): Branch[] => {
    if (!currentTree || !currentNode) return [];

    const availableBranches = currentNode.outgoingBranches
      .map((branchId) => currentTree.branches.get(branchId))
      .filter((branch): branch is Branch => {
        if (!branch || branch.locked) return false;

        // Check unlock conditions
        if (branch.unlockConditions) {
          const allUnlocksMet = branch.unlockConditions.every((cond) => evaluateCondition(cond));
          if (!allUnlocksMet) return false;
        }

        // Check required conditions
        const requiredConditions = branch.conditions.filter((c) => c.required);
        if (requiredConditions.length > 0) {
          const allRequiredMet = requiredConditions.every((cond) => evaluateCondition(cond));
          if (!allRequiredMet) return false;
        }

        return true;
      });

    // Sort by priority
    return availableBranches.sort((a, b) => b.priority - a.priority);
  }, [currentTree, currentNode, evaluateCondition]);

  // Start branching tree
  const startTree = useCallback(
    (treeId: string) => {
      const tree = trees.find((t) => t.id === treeId);
      if (!tree) return false;

      const startNode = tree.nodes.get(tree.startNodeId);
      if (!startNode) return false;

      setCurrentTree(tree);
      setCurrentNode(startNode);

      const path: BranchingPath = {
        id: `path-${Date.now()}`,
        treeId,
        nodes: [startNode.id],
        branches: [],
        startTime: new Date(),
        completed: false,
        choicesMade: [],
        conditionResults: [],
      };

      setCurrentPath(path);
      setAllPaths((prev) => [...prev, path]);

      // Mark node as visited
      tree.nodes.set(startNode.id, { ...startNode, visited: true });
      setCurrentTree({ ...tree });

      return true;
    },
    [trees]
  );

  // Take a branch
  const takeBranch = useCallback(
    (branchId: string, contextUpdates?: Partial<typeof userContext>) => {
      if (!currentTree || !currentNode || !currentPath) return false;

      const branch = currentTree.branches.get(branchId);
      if (!branch) return false;

      const toNode = currentTree.nodes.get(branch.toNodeId);
      if (!toNode) return false;

      // Update user context if provided
      if (contextUpdates) {
        setUserContext((prev) => ({ ...prev, ...contextUpdates }));
      }

      // Evaluate all conditions and record results
      const conditionResults = branch.conditions.map((cond) => ({
        branchId: branch.id,
        conditionId: cond.id,
        met: evaluateCondition(cond),
      }));

      // Update path
      const updatedPath: BranchingPath = {
        ...currentPath,
        nodes: [...currentPath.nodes, toNode.id],
        branches: [...currentPath.branches, branchId],
        choicesMade: [
          ...currentPath.choicesMade,
          { nodeId: currentNode.id, branchId, timestamp: new Date() },
        ],
        conditionResults: [...currentPath.conditionResults, ...conditionResults],
      };

      setCurrentPath(updatedPath);
      setAllPaths((prev) =>
        prev.map((p) => (p.id === currentPath.id ? updatedPath : p))
      );

      // Update current node and mark as visited
      toNode.visited = true;
      currentTree.nodes.set(toNode.id, toNode);
      setCurrentTree({ ...currentTree });
      setCurrentNode(toNode);

      // Update user context with previous choice
      setUserContext((prev) => ({
        ...prev,
        previousChoices: [...prev.previousChoices, branchId],
      }));

      // Check if reached end
      if (currentTree.endNodeIds.includes(toNode.id)) {
        completePath();
      }

      // Update analytics
      updateAnalytics(currentTree.id, branchId, toNode.id);

      props.onBranchTaken?.(branch, currentNode, toNode);
      return true;
    },
    [currentTree, currentNode, currentPath, evaluateCondition, props]
  );

  // Complete path
  const completePath = useCallback(() => {
    if (!currentPath) return;

    const completedPath: BranchingPath = {
      ...currentPath,
      endTime: new Date(),
      completed: true,
    };

    setCurrentPath(null);
    setAllPaths((prev) =>
      prev.map((p) => (p.id === currentPath.id ? completedPath : p))
    );

    props.onPathComplete?.(completedPath);
    setCurrentTree(null);
    setCurrentNode(null);
  }, [currentPath, props]);

  // Update analytics
  const updateAnalytics = useCallback(
    (treeId: string, branchId: string, nodeId: string) => {
      setAnalytics((prev) => {
        const paths = allPaths.filter((p) => p.treeId === treeId);

        const branchCounts = new Map<string, number>();
        const nodeCounts = new Map<string, number>();

        paths.forEach((path) => {
          path.branches.forEach((bid) => {
            branchCounts.set(bid, (branchCounts.get(bid) || 0) + 1);
          });
          path.nodes.forEach((nid) => {
            nodeCounts.set(nid, (nodeCounts.get(nid) || 0) + 1);
          });
        });

        // Include current branch/node
        branchCounts.set(branchId, (branchCounts.get(branchId) || 0) + 1);
        nodeCounts.set(nodeId, (nodeCounts.get(nodeId) || 0) + 1);

        const sortedBranches = Array.from(branchCounts.entries()).sort(
          (a, b) => b[1] - a[1]
        );

        const analytics: BranchingAnalytics = {
          treeId,
          totalPaths: paths.length,
          completedPaths: paths.filter((p) => p.completed).length,
          mostTakenBranch: sortedBranches[0]?.[0] || '',
          leastTakenBranch: sortedBranches[sortedBranches.length - 1]?.[0] || '',
          averagePathLength: paths.reduce((sum, p) => sum + p.nodes.length, 0) / paths.length || 0,
          branchTakeCounts: branchCounts,
          nodeVisitCounts: nodeCounts,
          popularPaths: [], // Could calculate most common paths
        };

        prev.set(treeId, analytics);
        return new Map(prev);
      });
    },
    [allPaths]
  );

  // Create custom branching tree
  const createTree = useCallback(
    (
      name: string,
      description: string,
      nodesData: Omit<BranchNode, 'visited'>[],
      branchesData: Branch[],
      startNodeId: string,
      endNodeIds: string[]
    ): string | null => {
      const nodes = new Map<string, BranchNode>();
      nodesData.forEach((node) => {
        nodes.set(node.id, { ...node, visited: false });
      });

      const branches = new Map<string, Branch>();
      branchesData.forEach((branch) => {
        branches.set(branch.id, branch);
      });

      const tree: BranchingTree = {
        id: `custom-tree-${Date.now()}`,
        name,
        description,
        nodes,
        branches,
        startNodeId,
        endNodeIds,
        mergeStrategy: 'converge',
        tags: ['custom'],
        autismFriendly: true,
        created: new Date(),
        lastModified: new Date(),
      };

      setTrees((prev) => [...prev, tree]);
      return tree.id;
    },
    []
  );

  // Get analytics for a tree
  const getTreeAnalytics = useCallback(
    (treeId: string): BranchingAnalytics | null => {
      return analytics.get(treeId) || null;
    },
    [analytics]
  );

  return {
    // State
    trees,
    currentTree,
    currentNode,
    currentPath,
    allPaths,
    userContext,
    settings,

    // Actions
    startTree,
    takeBranch,
    completePath,
    getAvailableBranches,
    evaluateCondition,
    setUserContext,
    createTree,
    getTreeAnalytics,
  };
};

// Example component
export const BranchingSystemComponent: React.FC<BranchingSystemProps> = (props) => {
  const {
    trees,
    currentTree,
    currentNode,
    startTree,
    getAvailableBranches,
    takeBranch,
    settings,
  } = useBranchingSystem(props);

  const availableBranches = getAvailableBranches();

  return (
    <div className="branching-system">
      {!currentTree ? (
        <div className="tree-selection">
          <h2>Choose Your Adventure</h2>
          <div className="trees-list">
            {trees.map((tree) => (
              <motion.div
                key={tree.id}
                className="tree-card"
                onClick={() => startTree(tree.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3>{tree.name}</h3>
                <p>{tree.description}</p>
                {tree.autismFriendly && (
                  <span className="badge">Autism-Friendly</span>
                )}
                <div className="tags">
                  {tree.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="branching-display">
          <h2>{currentTree.name}</h2>

          {currentNode && (
            <div className="current-node">
              <h3>{currentNode.title}</h3>
              {currentNode.content && <p>{currentNode.content}</p>}
            </div>
          )}

          {availableBranches.length > 0 && (
            <div className="available-branches">
              <h4>Choose Your Path:</h4>
              <div className="branches-list">
                {availableBranches.map((branch) => (
                  <motion.div
                    key={branch.id}
                    className="branch-option"
                    onClick={() => takeBranch(branch.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h5>{branch.name}</h5>
                    {settings.showBranchPreview && (
                      <p className="description">{branch.description}</p>
                    )}
                    {settings.showConditions && branch.conditions.length > 0 && (
                      <div className="conditions">
                        {branch.conditions.map((cond) => (
                          <span
                            key={cond.id}
                            className={`condition ${cond.required ? 'required' : 'optional'}`}
                          >
                            {cond.description}
                            {cond.required && ' *'}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="branch-tags">
                      {branch.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchingSystemComponent;
