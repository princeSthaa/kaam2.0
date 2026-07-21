type MaterialIconProps = {
  name: string;
};

export function MaterialIcon({ name }: MaterialIconProps) {
  return <span className="material-symbols-outlined">{name}</span>;
}
