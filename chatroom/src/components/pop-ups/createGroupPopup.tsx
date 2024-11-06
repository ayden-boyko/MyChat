import React, { useState, useEffect, useRef, useContext } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlusCircle } from "lucide-react";
import { GroupCreationPopupProps } from "../../interfaces/createGroup";
import { UserContext } from "../../lib/UserContext";
import { MiniGroup } from "../../interfaces/MiniGroup";
import { User } from "../../interfaces/userinterface";

export default function GroupCreationPopup({
  isOpen,
  onClose,
}: GroupCreationPopupProps) {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const context = useContext(UserContext);

  if (!context) {
    // Handle the case where the component is rendered outside the provider
    throw new Error("SomeChildComponent must be used within a UserProvider");
  }

  const { user, setUser } = context;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const firstInput = modalRef.current?.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API_URL
        }/api/groups/create/${groupName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_avatar: groupAvatar,
            creator: {
              user_uuid: user?.user_uuid,
              username: user?.username,
              user_profile: user?.user_profile,
            },
          }),
        }
      );

      const groupData = await result.json();

      console.log("groupCreationPopup.tsx - 71 - result", groupData);
      setGroupName("");
      setGroupAvatar(null);
      setUser({
        //adds group to user frontend
        ...user,
        groups: [...(user?.groups ?? []), groupData] as MiniGroup[],
      } as User);
      onClose();
    } catch (error) {
      console.error("CreateGroupPopup.tsx - 69 - Error creating group:", error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-2xl font-bold mb-4">
          Create New Group
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="groupAvatar">Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={groupAvatar || undefined}
                    alt="Group Avatar"
                  />
                  <AvatarFallback>
                    <PlusCircle className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="groupAvatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Label
                  htmlFor="groupAvatar"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                >
                  Upload Image
                </Label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
