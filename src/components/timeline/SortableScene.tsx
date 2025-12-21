import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Scene } from '@/hooks/useScenes';

interface SortableSceneProps {
  scene: Scene;
  isSelected: boolean;
  onClick: () => void;
}

export function SortableScene({ scene, isSelected, onClick }: SortableSceneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const waveform = scene.audio_waveform || Array(20).fill(0.5);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30'
      } ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="soft">Scene {scene.number}</Badge>
          <span className="font-medium">{scene.title}</span>
        </div>

        {/* Waveform visualization */}
        <div className="h-12 rounded-lg bg-muted/50 overflow-hidden flex items-center px-2 gap-px">
          {waveform.map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/60 rounded-full min-w-[2px]"
              style={{ height: `${(typeof height === 'number' ? height : 0.5) * 100}%` }}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {scene.duration}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            Audio
          </div>
        </div>
      </div>
    </div>
  );
}
