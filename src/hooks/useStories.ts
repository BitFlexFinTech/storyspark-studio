import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Scene } from './useScenes';

export interface Story {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  style: string | null;
  status: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  scenes?: Scene[];
}

export function useStories() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['stories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*, scenes(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Story[];
    },
    enabled: isAuthenticated,
  });
}

export function useStory(id: string) {
  return useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (story: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stories')
        .insert({ ...story, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Story> & { id: string }) => {
      const { data, error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story', variables.id] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

const sampleStoriesData = [
  {
    title: "Luna's Magical Garden Adventure",
    description: "A whimsical tale about a curious girl who discovers a secret garden filled with talking flowers and friendly woodland creatures.",
    style: "cinematic",
    status: "published",
    scenes: [
      { number: 1, title: "The Hidden Gate", script: "Luna discovers an old rusty gate behind the ivy.", visual_description: "Wide shot of overgrown garden wall with mysterious gate." },
      { number: 2, title: "First Bloom", script: "A rose speaks for the first time, welcoming Luna.", visual_description: "Close-up of talking rose with magical sparkles." },
      { number: 3, title: "The Butterfly Guide", script: "A golden butterfly leads Luna deeper into the garden.", visual_description: "Luna following butterfly through colorful flower tunnel." },
      { number: 4, title: "Garden's Heart", script: "Luna reaches the ancient tree at the garden's center.", visual_description: "Majestic tree with glowing leaves and woodland creatures." },
    ]
  },
  {
    title: "Captain Whiskers and the Treasure Map",
    description: "An adventurous story about a brave cat who sails the seven seas in search of legendary treasure.",
    style: "animated",
    status: "review",
    scenes: [
      { number: 1, title: "Setting Sail", script: "Captain Whiskers assembles his crew of mice.", visual_description: "Ship deck with cat captain and mouse crew." },
      { number: 2, title: "The Storm", script: "A fierce storm tests the crew's courage.", visual_description: "Dramatic ocean waves hitting the ship." },
      { number: 3, title: "X Marks the Spot", script: "The crew finally reaches the treasure island.", visual_description: "Tropical island with palm trees and treasure chest." },
    ]
  },
  {
    title: "The Dragon Who Couldn't Fly",
    description: "A heartwarming story about a young dragon who learns that being different can be a strength.",
    style: "storybook",
    status: "draft",
    scenes: [
      { number: 1, title: "Different Wings", script: "Ember watches other dragons soar while she stays grounded.", visual_description: "Young dragon looking up at flying dragons." },
      { number: 2, title: "A New Friend", script: "Ember meets a flightless bird who teaches her about inner strength.", visual_description: "Dragon and penguin sharing a moment." },
      { number: 3, title: "The Cave Discovery", script: "Ember discovers she can breathe the brightest fire.", visual_description: "Dragon illuminating dark cave with beautiful flames." },
      { number: 4, title: "Saving the Day", script: "Ember uses her unique gift to save the village.", visual_description: "Dragon lighting beacon to guide lost travelers." },
      { number: 5, title: "Acceptance", script: "The dragons celebrate Ember for who she is.", visual_description: "Dragon community gathering with Ember as hero." },
    ]
  }
];

export function useSeedSampleStories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const storyData of sampleStoriesData) {
        const { scenes, ...storyFields } = storyData;
        
        // Create story
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .insert({ ...storyFields, user_id: user.id })
          .select()
          .single();

        if (storyError) throw storyError;

        // Create scenes for this story
        const scenesWithStoryId = scenes.map(scene => ({
          ...scene,
          story_id: story.id,
        }));

        const { error: scenesError } = await supabase
          .from('scenes')
          .insert(scenesWithStoryId);

        if (scenesError) throw scenesError;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}
