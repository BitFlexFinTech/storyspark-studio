import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Wand2, Users, Video, Palette, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const Landing = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (role: "user" | "admin") => {
    login(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <header className="container mx-auto flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Story Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => handleLogin("user")}>
              User Login
            </Button>
            <Button variant="heroOutline" onClick={() => handleLogin("admin")}>
              Admin Login
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-6 py-20 text-center lg:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Content Creation for Kids
            </div>
            
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-7xl">
              Create Magical
              <span className="block text-gradient">Children's Stories</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              Transform your YouTube content into enchanting stories, captivating videos, 
              lovable characters, and merchandise — all powered by AI that understands 
              what makes kids' content magical.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                variant="hero"
                size="xl"
                onClick={() => handleLogin("user")}
                className="w-full sm:w-auto"
              >
                <Play className="h-5 w-5" />
                Enter as User
              </Button>
              <Button
                variant="heroSecondary"
                size="xl"
                onClick={() => handleLogin("admin")}
                className="w-full sm:w-auto"
              >
                <Users className="h-5 w-5" />
                Enter as Admin
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No signup required — click to explore the studio
            </p>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground lg:text-4xl">
            Everything You Need to Create
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From YouTube analysis to published content, Story Studio handles the entire creative workflow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Play,
              title: "YouTube Analysis",
              description: "Analyze channels and videos to understand style, pacing, and audience engagement.",
              color: "bg-primary/10 text-primary",
            },
            {
              icon: Wand2,
              title: "AI Story Generation",
              description: "Create compelling narratives with characters that kids will love and remember.",
              color: "bg-secondary/10 text-secondary",
            },
            {
              icon: Video,
              title: "Video Production",
              description: "Generate videos with scene-by-scene control and multi-language support.",
              color: "bg-accent/20 text-accent-foreground",
            },
            {
              icon: Palette,
              title: "Merch & More",
              description: "Design thumbnails, playlists, and merchandise for your characters.",
              color: "bg-status-published/10 text-status-published",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center lg:p-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
          <div className="relative">
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground lg:text-5xl">
              Ready to Create Magic?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
              Join Story Studio and start creating content that children will love.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                variant="glass"
                size="xl"
                onClick={() => handleLogin("user")}
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                Start Creating
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto border-t border-border px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Story Studio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 SleepyHeads Studio. Creating dreams for little ones.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
