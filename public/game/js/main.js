//=============================================================================
// main.js - AllStoryKor opening flow
// Velvet Shadows plays continuously from the opening movie into the title screen.
//=============================================================================

PluginManager.setup($plugins);

function startAllStoryAfterLogin() {
    var launched = false;
    var finished = false;

    document.body.style.margin = '0';
    document.body.style.background = '#000';
    document.body.style.overflow = 'hidden';

    // Keep RPG Maker from replacing Velvet Shadows with the normal title BGM.
    if (typeof Scene_Title !== 'undefined') {
        Scene_Title.prototype.playTitleMusic = function() {
            AudioManager.stopBgs();
            AudioManager.stopMe();
        };

        var _allstoryCommandNewGame = Scene_Title.prototype.commandNewGame;
        Scene_Title.prototype.commandNewGame = function() {
            stopOpeningMusic();
            _allstoryCommandNewGame.call(this);
        };

        var _allstoryCommandContinue = Scene_Title.prototype.commandContinue;
        Scene_Title.prototype.commandContinue = function() {
            stopOpeningMusic();
            _allstoryCommandContinue.call(this);
        };
    }

    var music = document.createElement('audio');
    music.id = 'allstoryOpeningMusic';
    music.src = 'audio/bgm/Velvet%20Shadows.mp3';
    music.preload = 'auto';
    music.loop = true;
    music.volume = 0.82;

    var video = document.createElement('video');
    video.id = 'allstoryOpeningVideo';
    video.src = 'movies/Allstory_Opening.mp4';
    video.preload = 'auto';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.muted = true; // video is intentionally silent; music comes from the audio element
    video.controls = false;
    video.style.position = 'fixed';
    video.style.left = '0';
    video.style.top = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.background = '#000';
    video.style.zIndex = '999999';

    var white = document.createElement('div');
    white.id = 'allstoryWhiteFade';
    white.style.position = 'fixed';
    white.style.left = '0';
    white.style.top = '0';
    white.style.width = '100vw';
    white.style.height = '100vh';
    white.style.background = '#fff';
    white.style.opacity = '0';
    white.style.pointerEvents = 'none';
    white.style.zIndex = '1000000';

    var gate = document.createElement('div');
    gate.id = 'allstoryOpeningGate';
    gate.style.position = 'fixed';
    gate.style.left = '0';
    gate.style.top = '0';
    gate.style.width = '100vw';
    gate.style.height = '100vh';
    gate.style.zIndex = '1000001';
    gate.style.background = 'rgba(0,0,0,0.60)';
    gate.style.display = 'none';
    gate.style.alignItems = 'center';
    gate.style.justifyContent = 'center';
    gate.style.color = 'rgba(255,255,255,0.92)';
    gate.style.fontFamily = 'GameFont, sans-serif';
    gate.style.fontSize = '22px';
    gate.style.letterSpacing = '0.08em';
    gate.textContent = 'Tap to begin';

    document.body.appendChild(music);
    document.body.appendChild(video);
    document.body.appendChild(white);
    document.body.appendChild(gate);

    function stopOpeningMusic() {
        var a = document.getElementById('allstoryOpeningMusic');
        if (a) {
            a.pause();
            a.currentTime = 0;
            if (a.parentNode) a.parentNode.removeChild(a);
        }
    }
    window.stopOpeningMusic = stopOpeningMusic;

    function runGame() {
        if (launched) return;
        launched = true;
        SceneManager.run(Scene_Boot);
    }

    function cleanupVideo() {
        if (video && video.parentNode) video.parentNode.removeChild(video);
        if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    }

    function showTitle() {
        if (finished) return;
        finished = true;

        // Fade the end of the movie into pure white.
        white.style.transition = 'opacity 0.9s ease-in-out';
        white.style.opacity = '1';

        setTimeout(function() {
            cleanupVideo();
            runGame();

            // Let Scene_Title and its background/menu render under the white screen,
            // then slowly reveal it while Velvet Shadows keeps playing uninterrupted.
            setTimeout(function() {
                white.style.transition = 'opacity 2.8s ease-in-out';
                white.style.opacity = '0';
                setTimeout(function() {
                    if (white && white.parentNode) white.parentNode.removeChild(white);
                    document.body.style.overflow = '';
                }, 3000);
            }, 700);
        }, 950);
    }

    function startOpening() {
        gate.style.display = 'none';
        music.currentTime = 0;
        video.currentTime = 0;

        var mp = music.play();
        var vp = video.play();
        Promise.all([
            mp && mp.catch ? mp : Promise.resolve(),
            vp && vp.catch ? vp : Promise.resolve()
        ]).catch(function() {
            video.pause();
            music.pause();
            gate.style.display = 'flex';
        });
    }

    video.addEventListener('ended', showTitle);
    video.addEventListener('error', showTitle);

    gate.addEventListener('pointerdown', startOpening, { once: true });
    gate.addEventListener('click', startOpening, { once: true });

    // Muted video can normally autoplay; audible music may be blocked by browsers.
    // If it is blocked, wait for one tap so movie and music start together at 0:00.
    var audioPromise = music.play();
    var videoPromise = video.play();

    if (audioPromise && typeof audioPromise.catch === 'function') {
        audioPromise.catch(function() {
            video.pause();
            music.pause();
            gate.style.display = 'flex';
        });
    }
    if (videoPromise && typeof videoPromise.catch === 'function') {
        videoPromise.catch(function() {
            gate.style.display = 'flex';
        });
    }
};

window.onload = function() {
    var platform = window.AllstoryPlatform;

    function makeLoginGate() {
        var gate = document.createElement('div');
        gate.id = 'allstoryAccountGate';
        gate.style.position = 'fixed';
        gate.style.left = '0';
        gate.style.top = '0';
        gate.style.width = '100vw';
        gate.style.height = '100vh';
        gate.style.zIndex = '2000000';
        gate.style.background = '#0b0b0d';
        gate.style.display = 'flex';
        gate.style.flexDirection = 'column';
        gate.style.alignItems = 'center';
        gate.style.justifyContent = 'center';
        gate.style.gap = '18px';
        gate.style.padding = '28px';
        gate.style.color = '#f4f4f5';
        gate.style.fontFamily = 'GameFont, sans-serif';
        gate.style.textAlign = 'center';

        var title = document.createElement('div');
        title.textContent = 'AllStoryKor';
        title.style.fontSize = '34px';
        title.style.letterSpacing = '0.06em';

        var message = document.createElement('div');
        message.id = 'allstoryAccountMessage';
        message.textContent = '우리 세상 우리 이야기의 기록을 이어가려면 계정 연결이 필요합니다.';
        message.style.maxWidth = '560px';
        message.style.fontSize = '18px';
        message.style.lineHeight = '1.65';
        message.style.color = 'rgba(255,255,255,0.78)';

        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Google로 계속하기';
        button.style.minWidth = '220px';
        button.style.minHeight = '50px';
        button.style.border = '0';
        button.style.borderRadius = '12px';
        button.style.padding = '0 22px';
        button.style.fontSize = '17px';
        button.style.fontWeight = '700';
        button.style.cursor = 'pointer';
        button.style.background = '#fff';
        button.style.color = '#18181b';

        gate.appendChild(title);
        gate.appendChild(message);
        gate.appendChild(button);
        document.body.appendChild(gate);
        return { gate: gate, button: button, message: message };
    }

    async function bootWithAccount() {
        if (!platform) {
            var missing = makeLoginGate();
            missing.button.disabled = true;
            missing.message.textContent = '공용 계정 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해주세요.';
            return;
        }

        try {
            var result = await platform.getSession();
            var session = result.data && result.data.session;
            if (session && session.user) {
                window.AllstoryCurrentUser = session.user;
                startAllStoryAfterLogin();
                return;
            }
        } catch (_) {}

        var ui = makeLoginGate();
        ui.button.addEventListener('click', async function() {
            ui.button.disabled = true;
            ui.message.textContent = 'Google 로그인 창을 확인해주세요...';
            try {
                var session = await platform.openSharedLogin();
                if (!session || !session.user) throw new Error('로그인 세션을 확인할 수 없습니다.');
                window.AllstoryCurrentUser = session.user;
                if (ui.gate.parentNode) ui.gate.parentNode.removeChild(ui.gate);
                startAllStoryAfterLogin();
            } catch (error) {
                ui.message.textContent = '계정 연결에 실패했습니다: ' + error.message;
                ui.button.disabled = false;
            }
        });
    }

    bootWithAccount();
};
