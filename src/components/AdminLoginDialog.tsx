import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = "adedas2026";

const AdminLoginDialog = () => {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true");
      setOpen(false);
      setPassword("");
      navigate("/admin");
    } else {
      toast({ title: "Invalid password", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Admin login">
          <Lock size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Admin Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginDialog;
