import { useEffect, useState } from "react";

interface AvatarProps {
  userId: string;
  firstName: string;
  size?: number;
  onClick?: () => void;
}

export default function Avatar({ userId, firstName, size = 32, onClick }: AvatarProps) {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem(`avatar_${userId}`);
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, [userId]);

  const style: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    overflow: "hidden",
    cursor: onClick ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (avatar) {
    return (
      <img
        src={avatar}
        alt="Avatar"
        onClick={onClick}
        style={{
          ...style,
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        ...style,
        backgroundColor: "#22C55E",
        color: "white",
        fontSize: `${size * 0.45}px`,
        fontWeight: 600,
      }}
    >
      {firstName?.charAt(0) || "U"}
    </div>
  );
}
