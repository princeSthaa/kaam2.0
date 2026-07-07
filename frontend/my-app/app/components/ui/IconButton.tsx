import { MaterialIcon } from "./MaterialIcon";
import { cx } from "../../legacy/classNames";

type IconButtonProps = {
  icon: string;
  label: string;
  href?: string;
  className?: string;
};

export function IconButton({ icon, label, href, className = "icon-btn" }: IconButtonProps) {
  if (href) {
    return (
      <a href={href} className={cx(className)} aria-label={label} title={label}>
        <MaterialIcon name={icon} />
      </a>
    );
  }

  return (
    <button className={cx(className)} type="button" aria-label={label} title={label}>
      <MaterialIcon name={icon} />
    </button>
  );
}
