import WebSocketManager from './socket.js';
const socket = new WebSocketManager('127.0.0.1:24050');

const cache = {};

// DOM 元素
const colorImg = document.getElementById('color');

////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// SETTINGS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

socket.sendCommand('getSettings', encodeURI(window.COUNTER_PATH));
socket.commands((data) => {
    try {
        const { command, message } = data;
        if (command === 'getSettings') {

            // FC颜色
            if (cache.FCCheckFCColor !== message.FCCheckFCColor) {
                cache.FCCheckFCColor = message.FCCheckFCColor;
            }
            // AP颜色
            if (cache.FCCheckAPColor !== message.FCCheckAPColor) {
                cache.FCCheckAPColor = message.FCCheckAPColor;
            }
            // 动画时长
            if (cache.FCCheckDuration !== message.FCCheckDuration) {
                cache.FCCheckDuration = message.FCCheckDuration;
                if (colorImg) {
                    colorImg.style.transition = `background ${cache.FCCheckDuration || 300}ms ease, opacity ${cache.FCCheckDuration || 300}ms ease`;
                }
            }
            FCCheck();
        }
    } catch (error) {
        console.log(error);
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// MAIN FUNCTION //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let fcBroken = false;
let lastStatenumber = null;

socket.api_v2(({ state, beatmap, play }) => {
    // 状态
    if (cache.statenumber !== state.number) {
        lastStatenumber = cache.statenumber;
        cache.statenumber = state.number;
    }

    // 播放进度
    if (cache.beatmaptimelive !== beatmap.time.live) {
        cache.beatmaptimelive = beatmap.time.live;
    }

    // 开始时间
    if (cache.beatmaptimefirstObject !== beatmap.time.firstObject) {
        cache.beatmaptimefirstObject = beatmap.time.firstObject;
    }

    // 等级
    if (cache.playrankcurrent !== play.rank.current) {
        cache.playrankcurrent = play.rank.current;
    }

    // 连击数
    if (cache.playcombocurrent !== play.combo.current) {
        cache.playcombocurrent = play.combo.current;
    }

    // 当前最大连击数
    if (cache.playcombomax !== play.combo.max) {
        cache.playcombomax = play.combo.max;
    }

    // 仅当statenumber从其他状态变为2时重置fcBroken
    if (
        cache.statenumber === 2 &&
        lastStatenumber !== 2
    ) {
        fcBroken = false;
    }

    FCCheck();
});

////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// FUNCTIONS ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function FCCheck() {
    if (
        cache.statenumber === 2 ||
        cache.statenumber === 7 ||
        cache.statenumber === 14 ||
        cache.statenumber === 17 ||
        cache.statenumber === 18
    ) {
        if (fcBroken) {
            return;
        }

        if (cache.beatmaptimelive > cache.beatmaptimefirstObject) {
            if (cache.playcombocurrent == 0 || cache.playcombocurrent !== cache.playcombomax) {
                colorImg.style.opacity = 0;
                fcBroken = true;
            } else if (cache.playrankcurrent !== 'XH' && cache.playrankcurrent !== 'X') {
                colorImg.style.background = cache.FCCheckFCColor;
            } else {
                colorImg.style.opacity = 1;
                colorImg.style.background = cache.FCCheckAPColor;
            }
        }
    } else {
        colorImg.style.opacity = 0;
    }
}
