// main.js
let speakerCount = 0;

const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;

const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
        app: {
            id: "4a7c0614-dfc1-478b-ab8a-07c6566fd099",
            turn: true,
            actions: ['read'],
            channels: [
                {
                    id: '*',
                    name: '*',
                    actions: ['write'],
                    members: [
                        {
                            id: '*',
                            name: '*',
                            actions: ['write'],
                            publication: {
                                actions: ['write'],
                            },
                            subscription: {
                                actions: ['write'],
                            },
                        },
                    ],
                    sfuBots: [
                        {
                            actions: ['write'],
                            forwardings: [
                                {
                                    actions: ['write'],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
}).encode("g6fpXSdbxTfAMBm/aC7cvcFO0XONOf6wPJbco577uM0=");

document.addEventListener('DOMContentLoaded', async function () {
    const videoToggle = document.getElementById('videoToggle');
    const localVideo = document.getElementById('local-video');
    const status = document.getElementById('status');

    videoToggle.addEventListener('change', function () {
        if (this.checked) {
            localVideo.style.display = 'block';
            status.textContent = 'カメラ ON';
        } else {
            localVideo.style.display = 'none';
            status.textContent = 'カメラ OFF';
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const localVideo = document.getElementById('local-video');
    const remoteMediaArea = document.getElementById('remote-media-area');
    const channelNameInput = document.getElementById('channel-name');
    const myId = document.getElementById('my-id');
    const joinButton = document.getElementById('join');

    const dataStreamInput = document.getElementById('data-stream');

    const textdata = await SkyWayStreamFactory.createDataStream();

    let isEnterKeyPressed = false;

    const notes = document.querySelectorAll('.note');

    const dataStreams = [];
    dataStreams.push(textdata);

    const mousedata = {
        x: 0,
        y: 0,
        notesData: [],
    };

    document.addEventListener('mousemove', (event) => {
        mousedata.x = event.clientX;
        mousedata.y = event.clientY;
    });

    setInterval(async () => {
        mousedata.notesData = [];
        notes.forEach((note) => {
            const noteData = {
                noteId: note.getAttribute('data-note-id'),
                left: note.style.left,
                top: note.style.top,
                gazeTime: note.getAttribute('data-gaze-time'),
                notetext: note.getAttribute('data-text'),
            };
            mousedata.notesData.push(noteData);
        });

        if (speakerCount > 0) {
            textdata.write(mousedata);
        }
    }, 10);

    const { audio, video } =
        await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();
    video.attach(localVideo);
    await localVideo.play();

    const dataStreamSubscribers = [];

    // 最初にHTMLに記述された6つのgaze-time-elementを取得
    const initialGazeTimeElements = document.querySelectorAll('#gazetime1-area .gaze-time-element');

    joinButton.onclick = async () => {
        if (channelNameInput.value === '') return;

        const context = await SkyWayContext.Create(token);
        const channel = await SkyWayRoom.FindOrCreate(context, {
            type: 'p2p',
            name: channelNameInput.value,
        });
        const me = await channel.join();

        myId.textContent = me.id;

        await me.publish(audio);
        await me.publish(video);
        await me.publish(textdata);

        const subscribeAndAttach = async (publication) => {
            if (publication.publisher.id === me.id) {
                return;
            }

            const { stream } = await me.subscribe(publication.id);

            switch (stream.contentType) {
                case 'video':
                    {
                        speakerCount++;

                        const videoContainer = document.createElement('div');

                        videoContainer.id = `video-container-${speakerCount}`;
                        const elm = document.createElement('video');
                        elm.playsInline = true;
                        elm.autoplay = true;
                        elm.classList.add('video-element', `speaker-${speakerCount}`);
                        stream.attach(elm);

                        videoContainer.appendChild(elm);
                        remoteMediaArea.appendChild(videoContainer);

                        videoContainer.classList.add(`video-container:nth-child(${speakerCount})`);
                    }
                    break;
                case 'audio':
                    {
                        const elm = document.createElement('audio');
                        elm.controls = true;
                        elm.autoplay = true;
                        elm.classList.add('audio-element');
                        stream.attach(elm);
                        remoteMediaArea.appendChild(elm);
                    }
                    break;
                case 'data':
                    {
                        const subscriberIndex = speakerCount - 1;

                        dataStreamSubscribers[subscriberIndex] = stream.onData;

                        dataStreamSubscribers[subscriberIndex].add((mousedata) => {
                            mousedata.notesData.forEach((noteData) => {
                                const note = document.querySelector(`.note[data-note-id="${noteData.noteId}"]`);
                                if (note) {
                                    note.style.left = noteData.left;
                                    note.style.top = noteData.top;
                                }
                            });

                            const gazetimeAreaId = `gazetime${subscriberIndex + 1}-area`;

                            // 最初に取得したgaze-time-elementを更新
                            const gazetimeElements = document.querySelectorAll(`#${gazetimeAreaId} .gaze-time-element`);
                            gazetimeElements.forEach((element, index) => {
                                const noteData = mousedata.notesData[index];
                                element.textContent = `${noteData.noteId}, text: ${noteData.notetext}, Gaze Time: ${noteData.gazeTime}`;
                            });
                        });

                    }
                    break;
            }
        };

        channel.publications.forEach((publication) => subscribeAndAttach(publication));
        channel.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
    };
});
