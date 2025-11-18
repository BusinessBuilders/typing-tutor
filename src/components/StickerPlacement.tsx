/**
 * Sticker Placement Component
 * Step 236 - Add placement feature for arranging stickers in custom spaces
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Sticker } from './StickerSystem';

// Placed sticker interface
export interface PlacedSticker {
  id: string;
  stickerId: string;
  sticker: Sticker;
  position: { x: number; y: number }; // Percentage-based positioning
  rotation: number; // Degrees
  scale: number; // 0.5 - 2.0
  layer: number; // Z-index for layering
  flipped: boolean; // Horizontal flip
}

// Room/space themes
export interface RoomTheme {
  id: string;
  name: string;
  icon: string;
  background: string; // CSS gradient or color
  pattern?: string; // Optional background pattern
  unlocked: boolean;
}

// Default room themes
const ROOM_THEMES: RoomTheme[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    icon: '⬜',
    background: 'bg-gray-100',
    unlocked: true,
  },
  {
    id: 'notebook',
    name: 'Notebook',
    icon: '📓',
    background: 'bg-gradient-to-r from-blue-50 to-blue-100',
    pattern: 'linear-notebook',
    unlocked: true,
  },
  {
    id: 'corkboard',
    name: 'Cork Board',
    icon: '📌',
    background: 'bg-gradient-to-br from-yellow-800 to-orange-900',
    pattern: 'cork-texture',
    unlocked: true,
  },
  {
    id: 'space',
    name: 'Outer Space',
    icon: '🌌',
    background: 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black',
    pattern: 'stars',
    unlocked: false,
  },
  {
    id: 'beach',
    name: 'Beach',
    icon: '🏖️',
    background: 'bg-gradient-to-b from-sky-300 via-yellow-100 to-yellow-200',
    pattern: 'sand',
    unlocked: false,
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    background: 'bg-gradient-to-b from-green-700 via-green-500 to-green-800',
    pattern: 'trees',
    unlocked: false,
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    background: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',
    unlocked: false,
  },
];

// Grid snapping options
const GRID_SIZES = [
  { value: 0, label: 'Free' },
  { value: 25, label: '4x4' },
  { value: 20, label: '5x5' },
  { value: 10, label: '10x10' },
  { value: 5, label: '20x20' },
];

// Custom hook for sticker placement
export function useStickerPlacement() {
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedPlaced, setSelectedPlaced] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<RoomTheme>(ROOM_THEMES[0]);
  const [gridSize, setGridSize] = useState(0); // 0 = no grid
  const [showGrid, setShowGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const placeSticker = (sticker: Sticker, position?: { x: number; y: number }) => {
    const newPlaced: PlacedSticker = {
      id: Date.now().toString(),
      stickerId: sticker.id,
      sticker,
      position: position || { x: 50, y: 50 },
      rotation: 0,
      scale: 1,
      layer: placedStickers.length,
      flipped: false,
    };

    setPlacedStickers((prev) => [...prev, newPlaced]);
    setSelectedPlaced(newPlaced.id);
    return newPlaced;
  };

  const removeSticker = (placedId: string) => {
    setPlacedStickers((prev) => prev.filter((p) => p.id !== placedId));
    if (selectedPlaced === placedId) {
      setSelectedPlaced(null);
    }
  };

  const updateSticker = (placedId: string, updates: Partial<PlacedSticker>) => {
    setPlacedStickers((prev) =>
      prev.map((p) => (p.id === placedId ? { ...p, ...updates } : p))
    );
  };

  const moveToFront = (placedId: string) => {
    const maxLayer = Math.max(...placedStickers.map((p) => p.layer), 0);
    updateSticker(placedId, { layer: maxLayer + 1 });
  };

  const moveToBack = (placedId: string) => {
    const minLayer = Math.min(...placedStickers.map((p) => p.layer), 0);
    updateSticker(placedId, { layer: minLayer - 1 });
  };

  const clearAll = () => {
    setPlacedStickers([]);
    setSelectedPlaced(null);
  };

  const snapToGrid = (value: number) => {
    if (gridSize === 0) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  return {
    placedStickers,
    selectedPlaced,
    setSelectedPlaced,
    currentTheme,
    setCurrentTheme,
    gridSize,
    setGridSize,
    showGrid,
    setShowGrid,
    isDragging,
    setIsDragging,
    placeSticker,
    removeSticker,
    updateSticker,
    moveToFront,
    moveToBack,
    clearAll,
    snapToGrid,
  };
}

// Main sticker placement component
export default function StickerPlacement({ availableStickers }: { availableStickers: Sticker[] }) {
  const {
    placedStickers,
    selectedPlaced,
    setSelectedPlaced,
    currentTheme,
    setCurrentTheme,
    gridSize,
    setGridSize,
    showGrid,
    setShowGrid,
    placeSticker,
    removeSticker,
    updateSticker,
    moveToFront,
    moveToBack,
    clearAll,
    snapToGrid,
  } = useStickerPlacement();

  const { settings } = useSettingsStore();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const selectedStickerData = placedStickers.find((p) => p.id === selectedPlaced);

  const handleDragEnd = (placedId: string, event: any, info: any) => {
    const canvas = event.target.closest('.placement-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = snapToGrid(((info.point.x - rect.left) / rect.width) * 100);
    const y = snapToGrid(((info.point.y - rect.top) / rect.height) * 100);

    updateSticker(placedId, {
      position: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎨 Sticker Room
      </h2>

      {/* Toolbar */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setShowStickerPicker(true)}
            className="py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
          >
            ➕ Add Sticker
          </button>
          <button
            onClick={() => setShowThemePicker(true)}
            className="py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
          >
            🎨 Theme
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`py-3 px-4 ${
              showGrid ? 'bg-green-500' : 'bg-gray-300'
            } text-white rounded-lg font-bold hover:scale-105 transition-transform`}
          >
            ⌗ Grid {showGrid ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={clearAll}
            className="py-3 px-4 bg-red-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
          >
            🗑️ Clear All
          </button>
        </div>

        {/* Grid size selector */}
        {showGrid && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">Grid Size:</span>
            {GRID_SIZES.map((grid) => (
              <button
                key={grid.value}
                onClick={() => setGridSize(grid.value)}
                className={`px-3 py-1 rounded text-sm font-bold ${
                  gridSize === grid.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {grid.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="mb-6">
        <div
          className={`
            placement-canvas relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl
            ${currentTheme.background}
          `}
          style={{
            backgroundSize: showGrid && gridSize > 0 ? `${gridSize}% ${gridSize}%` : 'auto',
            backgroundImage: showGrid && gridSize > 0
              ? 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)'
              : 'none',
          }}
        >
          {/* Placed stickers */}
          <AnimatePresence>
            {placedStickers.map((placed) => (
              <motion.div
                key={placed.id}
                drag
                dragMomentum={false}
                dragElastic={0}
                onDragEnd={(e, info) => handleDragEnd(placed.id, e, info)}
                onClick={() => setSelectedPlaced(placed.id)}
                className={`
                  absolute cursor-move
                  ${selectedPlaced === placed.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}
                `}
                style={{
                  left: `${placed.position.x}%`,
                  top: `${placed.position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${placed.rotation}deg) scale(${placed.scale}) scaleX(${placed.flipped ? -1 : 1})`,
                  zIndex: placed.layer,
                }}
              >
                <div className="text-6xl select-none">{placed.sticker.emoji}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {placedStickers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-xl font-bold">Your Canvas Awaits!</div>
                <div>Click "Add Sticker" to start decorating</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls for selected sticker */}
      {selectedStickerData && (
        <div className="mb-6 bg-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-900">
              Selected: {selectedStickerData.sticker.emoji} {selectedStickerData.sticker.name}
            </h3>
            <button
              onClick={() => selectedPlaced && removeSticker(selectedPlaced)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
            >
              🗑️ Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rotation */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Rotation: {selectedStickerData.rotation}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedStickerData.rotation}
                onChange={(e) =>
                  selectedPlaced && updateSticker(selectedPlaced, { rotation: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Scale */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Size: {Math.round(selectedStickerData.scale * 100)}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={selectedStickerData.scale * 100}
                onChange={(e) =>
                  selectedPlaced && updateSticker(selectedPlaced, { scale: parseInt(e.target.value) / 100 })
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() =>
                selectedPlaced && updateSticker(selectedPlaced, { flipped: !selectedStickerData.flipped })
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              ↔️ Flip
            </button>
            <button
              onClick={() => selectedPlaced && moveToFront(selectedPlaced)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
            >
              ⬆️ To Front
            </button>
            <button
              onClick={() => selectedPlaced && moveToBack(selectedPlaced)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600"
            >
              ⬇️ To Back
            </button>
            <button
              onClick={() =>
                selectedPlaced && updateSticker(selectedPlaced, { rotation: 0, scale: 1, flipped: false })
              }
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {placedStickers.length}
            </div>
            <div className="text-sm text-gray-600">Stickers Placed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">
              {availableStickers.filter((s) => s.unlocked).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {ROOM_THEMES.filter((t) => t.unlocked).length}
            </div>
            <div className="text-sm text-gray-600">Themes</div>
          </div>
        </div>
      </div>

      {/* Theme picker modal */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowThemePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-8 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Theme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {ROOM_THEMES.map((theme, index) => (
                  <motion.button
                    key={theme.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                    onClick={() => {
                      if (theme.unlocked) {
                        setCurrentTheme(theme);
                        setShowThemePicker(false);
                      }
                    }}
                    disabled={!theme.unlocked}
                    className={`
                      relative aspect-video rounded-xl overflow-hidden
                      ${theme.background}
                      ${theme.unlocked
                        ? 'cursor-pointer hover:scale-105'
                        : 'opacity-50 cursor-not-allowed'
                      }
                      ${currentTheme.id === theme.id ? 'ring-4 ring-purple-500' : ''}
                      transition-all
                    `}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="text-4xl mb-2">{theme.icon}</div>
                      <div className="font-bold text-shadow">{theme.name}</div>
                      {!theme.unlocked && (
                        <div className="mt-2 text-sm">🔒 Locked</div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setShowThemePicker(false)}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker picker modal */}
      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStickerPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Sticker</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-6">
                {availableStickers
                  .filter((s) => s.unlocked)
                  .map((sticker, index) => (
                    <motion.button
                      key={sticker.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: settings.reducedMotion ? 0 : index * 0.02 }}
                      onClick={() => {
                        placeSticker(sticker);
                        setShowStickerPicker(false);
                      }}
                      className="aspect-square rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 flex items-center justify-center text-5xl hover:scale-110 transition-all"
                    >
                      {sticker.emoji}
                    </motion.button>
                  ))}
              </div>
              {availableStickers.filter((s) => s.unlocked).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🔒</div>
                  <div className="text-xl font-bold">No Stickers Available</div>
                  <div>Unlock stickers to place them here!</div>
                </div>
              )}
              <button
                onClick={() => setShowStickerPicker(false)}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
