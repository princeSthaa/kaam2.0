import { MaterialIcon } from "../ui/MaterialIcon";

type FolderSearchProps = {
  placeholder: string;
  ariaLabel: string;
};

export function FolderSearch({ placeholder, ariaLabel }: FolderSearchProps) {
  return (
    <div className="folder-search">
      <MaterialIcon name="search" />
      <input type="search" id="folderSearchInput" placeholder={placeholder} aria-label={ariaLabel} />
    </div>
  );
}
