import dayjs from "dayjs";
import { Edit3, Trash2 } from "lucide-react";
import { Artwork } from "../../../types/artwork";
import styles from "./styles.module.css";

interface ArtworkCardProps {
  artwork: Artwork;
  onEdit: (artworkId: string) => void;
  onDelete?: (artworkId: string) => void;
}

export const ArtworkCard = ({ artwork, onEdit, onDelete }: ArtworkCardProps): JSX.Element => (
  <article className={styles.card}>
    <button
      className={styles.previewButton}
      type="button"
      onClick={() => onEdit(artwork.id)}
      aria-label={`编辑作品 ${artwork.name}`}
    >
      <img src={artwork.thumbnail} alt={`${artwork.name} 缩略图`} />
    </button>
    <div className={styles.body}>
      <div>
        <h3>{artwork.name}</h3>
        <p>{dayjs(artwork.createdAt).format("YYYY-MM-DD HH:mm")}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => onEdit(artwork.id)}>
          <Edit3 size={16} aria-hidden="true" />
          编辑
        </button>
        {onDelete ? (
          <button className={styles.deleteButton} type="button" onClick={() => onDelete(artwork.id)}>
            <Trash2 size={16} aria-hidden="true" />
            删除
          </button>
        ) : null}
      </div>
    </div>
  </article>
);

