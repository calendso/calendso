import { useSession } from "next-auth/react";
import { FC, Fragment } from "react";

type AdminRequiredProps = {
  as?: keyof JSX.IntrinsicElements;
};

export const AdminRequired: FC<AdminRequiredProps> = ({ children, as, ...rest }) => {
  const session = useSession();

  if (session.data?.user.role !== "ADMIN") return null;
  const Component = as ?? Fragment;
  return <Component {...rest}>{children}</Component>;
};
