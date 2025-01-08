import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/user-context";
import { getTokenDetails, removeLocalStorage, setLocalStorage } from "@/lib/utils";
import { getUserDetails, login } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";

export function UserLoginDialog() {
  const { user, setUser, userPlans, setUserPlans } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [plans, setPlans] = useState([]);
  const { toast } = useToast();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "username") {
      setUserName(e.target.value);
    } else if (e.target.id === "password") {
      setPassword(e.target.value);
    }
  };

  const handleButton = async () => {
    setIsLoading(true);

    if (!user) {
      const data = await login(userName?.trim(), password?.trim());

      const userInitialDetails = data?.data;

      const tokenDetails = getTokenDetails(data?.data?.token);
      // console.log({
      //   tokenDetails,
      //   exp: new Date(tokenDetails?.exp).toUTCString(),
      //   iat: new Date(tokenDetails?.iat).toUTCString(),
      //   nbf: new Date(tokenDetails?.nbf).toUTCString(),
      // });

      if (data?.data?.token && tokenDetails?.data?.user) {
        const { data } = await getUserDetails(tokenDetails?.data?.user?.id);

        const userPlanDetails = data?.response?.result;
        setUserPlans(userPlanDetails?.memberships ?? []);

        setUser(userInitialDetails);
        setLocalStorage("user", userInitialDetails);
        setLocalStorage("userPlans", userPlanDetails?.memberships);

        toast({
          variant: "default",
          title: "Success",
          description: "Login Successful.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Please check your username and password.",
        });
      }
    } else {
      setUser(undefined);
      setPlans(undefined);
      setUserName("");
      setPassword("");
      removeLocalStorage("user");
      removeLocalStorage("userPlans");
    }

    setIsLoading(false);
  };

  const isLoginSuccessful = useMemo(() => {
    return false;
  }, [plans]);

  useEffect(() => {
    if (user) {
      setUserName(user?.user_display_name);
      setPassword("********");
    }

    if (userPlans) {
      setPlans(userPlans);
    }
  }, [user, plans]);
  return (
    <Dialog defaultOpen={!user}>
      <DialogTrigger asChild>
        <Button variant="outline">{user ? `${user?.user_display_name} Details` : "Log In to Unlock Features"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log In</DialogTitle>
          <DialogDescription>Reliability Management Account Details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Username
            </Label>
            <Input id="username" value={userName} className="col-span-3" onChange={handleInput} disabled={user} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Password
            </Label>
            <Input id="password" value={password} type="password" className="col-span-3" onChange={handleInput} disabled={user} />
          </div>
        </div>
        {user && (
          <div>
            <p className="font-bold text-green-700">Subscribed Plans:</p>
            {plans.map((plan: any) => (
              <div key={plan.id}>
                <p>{plan.name}</p>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button type="submit" onClick={handleButton} disabled={isLoading}>
            {isLoading ? "Loading..." : user ? "Log Out" : "Log In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
