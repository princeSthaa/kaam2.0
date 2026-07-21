import { MaterialIcon } from "./MaterialIcon";
import { cx } from "../../lib/classNames";

type IconButtonProps = {
  icon: string;
  label: string;
  href?: string;
  className?: string;
  onClick?: () => void;
};

export function IconButton({ icon, label, href, className = "icon-btn", onClick }: IconButtonProps) {
  if (href) {
    return (
      <a href={href} className={cx(className)} aria-label={label} title={label}>
        <MaterialIcon name={icon} />
      </a>
    );
  }

  return (
    <button className={cx(className)} type="button" aria-label={label} title={label} onClick={onClick}>
      <MaterialIcon name={icon} />
    </button>
  );
}
