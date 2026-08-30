// AllStory shared account foundation.
// Uses the same Supabase project and user identity as 너울 속 아이.
(function() {
    'use strict';

    var CONFIG = {
        supabaseUrl: 'https://dvkmpmwzmcwxivtfjpmm.supabase.co',
        publishableKey: 'sb_publishable_9q0F7lNNZex_CO-LJHKYeg_hAlOnZA5',
        gameSlug: 'allstory',
        accountBridgeUrl: 'https://neoul-sok-ai.vercel.app/account.html',
        neoulUrl: 'https://neoul-sok-ai.vercel.app/'
    };

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error('[AllStory] Supabase client library is not loaded.');
        return;
    }

    var client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.publishableKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });

    function randomNonce() {
        if (window.crypto && window.crypto.getRandomValues) {
            var bytes = new Uint8Array(24);
            window.crypto.getRandomValues(bytes);
            return Array.prototype.map.call(bytes, function(b) { return ('0' + b.toString(16)).slice(-2); }).join('');
        }
        return String(Date.now()) + Math.random().toString(36).slice(2);
    }

    async function getSession() { return client.auth.getSession(); }
    async function getUser() { return client.auth.getUser(); }
    async function signOut() { return client.auth.signOut(); }

    async function getGame(gameSlug) {
        return client.from('games')
            .select('id, slug, title, status, base_access, is_membership_included, engine, engine_version')
            .eq('slug', gameSlug || CONFIG.gameSlug)
            .single();
    }

    async function hasGameAccess(gameSlug) {
        return client.rpc('has_game_access', { target_game_slug: gameSlug || CONFIG.gameSlug });
    }

    function openSharedLogin() {
        return new Promise(function(resolve, reject) {
            var nonce = randomNonce();
            var url = CONFIG.accountBridgeUrl + '?bridge=allstory&nonce=' + encodeURIComponent(nonce);
            var popup = window.open(url, 'AllStoryAccount', 'width=620,height=760,resizable=yes,scrollbars=yes');
            if (!popup) {
                reject(new Error('로그인 창을 열 수 없습니다. 팝업 허용을 확인해주세요.'));
                return;
            }

            var settled = false;
            var timer = window.setTimeout(function() {
                cleanup();
                reject(new Error('로그인 시간이 초과되었습니다.'));
            }, 300000);

            function cleanup() {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                window.removeEventListener('message', onMessage);
            }

            async function onMessage(event) {
                var data = event.data || {};
                if (data.type !== 'allstory-auth-session' || data.nonce !== nonce || !data.session) return;
                if (event.origin && event.origin !== 'https://neoul-sok-ai.vercel.app') return;
                try {
                    var result = await client.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token
                    });
                    if (result.error) throw result.error;
                    cleanup();
                    try { popup.close(); } catch (_) {}
                    resolve(result.data && result.data.session);
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            }

            window.addEventListener('message', onMessage);
        });
    }

    function openNeoul() {
        var child = window.open(CONFIG.neoulUrl + '?from=allstory', '_blank');
        if (!child) throw new Error('너울 속 아이 창을 열 수 없습니다. 팝업 허용을 확인해주세요.');
        try { child.focus(); } catch (_) {}
        return child;
    }

    window.AllstoryPlatform = {
        config: CONFIG,
        client: client,
        getSession: getSession,
        getUser: getUser,
        signOut: signOut,
        getGame: getGame,
        hasGameAccess: hasGameAccess,
        openSharedLogin: openSharedLogin,
        openNeoul: openNeoul
    };
})();
