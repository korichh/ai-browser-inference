import { ILink } from "../../interfaces";
import { NavLink } from "react-router";

interface NavProps {
  links: ILink[];
}

export function Nav({ links }: NavProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      {links.map(({ url, label }) => (
        <NavLink key={`${url}-${label}`} to={url}>
          {label}
        </NavLink>
      ))}
    </div>
  );
}
