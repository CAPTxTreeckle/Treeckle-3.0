import { useState } from "react";
import ReactPlayer from "react-player/youtube";

import PlaceholderWrapper from "../placeholder-wrapper";
import styles from "./video-player.module.scss";

type Props = {
  video: string;
};

function VideoPlayer({ video }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setError] = useState(false);

  return (
    <div className={styles.videoPlayerWrapper}>
      {(!loaded || hasError) && (
        <PlaceholderWrapper
          className={styles.loaderContainer}
          loading={!hasError && !loaded}
          loadingMessage="Loading video"
          showDefaultMessage={hasError}
          defaultMessage="Failed to load video"
        />
      )}

      <ReactPlayer
        width="100%"
        height="100%"
        controls
        url={video}
        onReady={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export default VideoPlayer;
