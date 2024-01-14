import axios from 'axios';
import React, { FC, useEffect, useState } from 'react'

type Props = {
    videoUrl: string;
    title: string;
}

const CoursePlayer: FC<Props> = ({ videoUrl, title }) => {
    const [videoData, setVideoData] = useState({
        otp: "",
        playbackInfo: ""
    });

    useEffect(() => {
        axios
            .post(`http://localhost:4000/api/v1/get/vdocipher/otp`, {
                videoId: videoUrl,
            })
            .then((res) => {
                setVideoData(res.data);
            });
    }, [videoUrl])
  return (
      <div>
          {/*  otp: 20160313versASE323uiquvzdmzKXtroJWJx26gJ2mCK50hrbAhlq6KYWmq4yg92 */}
          <div style={{ paddingTop: '56%', position: 'relative' }}>
              <iframe
                  src={`https://player.vdocipher.com/v2/?otp=${videoData?.otp}&playbackInfo=${videoData.playbackInfo}&player=7R4usi6eJ9mxYCeC`}
                  style={{
                      border: 0,
                      width: '90%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                  }}
                  allowFullScreen={true}
                  allow="encrypted-media"
              ></iframe>
          </div>
      </div>
  );
}

export default CoursePlayer
