import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArtworkCard } from "../../components/common/ArtworkCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { ROUTES } from "../../constants/app";
import { useArtworkStore } from "../../stores/useArtworkStore";
import styles from "./styles.module.css";

export const Gallery = (): JSX.Element => {
  const navigate = useNavigate();
  const artworks = useArtworkStore((state) => state.artworks);
  const deleteArtwork = useArtworkStore((state) => state.deleteArtwork);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | undefined>();
  const sortedArtworks = useMemo(
    () => [...artworks].sort((left, right) => dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf()),
    [artworks]
  );

  const confirmDelete = (): void => {
    if (pendingDeleteId) {
      deleteArtwork(pendingDeleteId);
      setPendingDeleteId(undefined);
    }
  };

  return (
    <main className={styles.gallery}>
      <header className={styles.header}>
        <button type="button" onClick={() => navigate(ROUTES.home)}>
          <ArrowLeft size={18} aria-hidden="true" />
          首页
        </button>
        <div>
          <p>Gallery</p>
          <h1>我的作品</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className={styles.grid} aria-label="作品列表">
        {sortedArtworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onEdit={(artworkId) => navigate(`${ROUTES.editor}/${artworkId}`)}
            onDelete={setPendingDeleteId}
          />
        ))}
      </section>

      <ConfirmDialog
        open={pendingDeleteId !== undefined}
        title="删除作品"
        description="删除后该作品会从本地作品集中移除。"
        confirmLabel="删除作品"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(undefined)}
      />
    </main>
  );
};

