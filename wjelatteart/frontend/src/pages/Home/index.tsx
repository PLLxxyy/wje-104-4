import dayjs from "dayjs";
import { ArrowRight, FolderOpen, PenLine } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArtworkCard } from "../../components/common/ArtworkCard";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { APP_NAME, APP_TAGLINE, HOME_RECENT_LIMIT, ROUTES } from "../../constants/app";
import { useArtworkStore } from "../../stores/useArtworkStore";
import styles from "./styles.module.css";

export const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const artworks = useArtworkStore((state) => state.artworks);
  const recentArtworks = useMemo(
    () =>
      [...artworks]
        .sort((left, right) => dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf())
        .slice(0, HOME_RECENT_LIMIT),
    [artworks]
  );

  return (
    <main className={styles.home}>
      <header className={styles.nav}>
        <strong>{APP_NAME}</strong>
        <ThemeToggle />
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Latte Art Studio</p>
          <h1>{APP_NAME}</h1>
          <p>{APP_TAGLINE}。选择工具、叠放图层、保存作品，并导出可分享的 PNG。</p>
          <div className={styles.actions}>
            <button type="button" onClick={() => navigate(ROUTES.editor)}>
              <PenLine size={18} aria-hidden="true" />
              开始创作
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => navigate(ROUTES.gallery)}>
              <FolderOpen size={18} aria-hidden="true" />
              我的作品
            </button>
          </div>
        </div>
        <div className={styles.cupStage} aria-hidden="true">
          <div className={styles.cup}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className={styles.recent}>
        <div className={styles.sectionHeader}>
          <p>Recent</p>
          <h2>最近作品</h2>
        </div>
        <div className={styles.grid}>
          {recentArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onEdit={(artworkId) => navigate(`${ROUTES.editor}/${artworkId}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

