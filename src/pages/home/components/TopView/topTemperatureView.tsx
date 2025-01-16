import React, { useState, useEffect } from 'react';
import { Text, View, Button, Picker, showModal, vibrateShort } from '@ray-js/ray';
import {Svg, Icon} from '@ray-js/svg';
import { useActions, useDevInfo, useDpSchema, useProps } from "@ray-js/panel-sdk";
import styles from './topTemperatureView.module.less';
import Strings from '@/i18n';
import RayCircleProgress from '@ray-js/circle-progress';

const productConfig = {
    setTempMin_c:30,
    setTempMax_c:60,
    setTempMin_f:86,
    setTempMax_f:140,
    isShowAntiFreeze: false,
    iconWidth: 23,
    iconStyle: styles.icon1,
}

export default function TopTemperatureView() {
    const dpSchema = useDpSchema();
    const devInfo = useDevInfo();
    const dpState = useProps(state => state); // 获取所有dpState
    const actions = useActions();

    const switch_power = dpState["switch"]
    const unit = dpState["temp_unit_convert"]
    const temp_c = dpState['temp_set']
    const temp_f = dpState['temp_set_f']
    const heating = dpState['heating']
    const flow = dpState['flow']
    const antiFreeze = dpState['anti_freeze']

    const setTemp = unit==='c'?temp_c:temp_f

    const activeIconColor = '#295bdd'//'rgb(135,88,128)'
    const lazyIconColor = '#a5a5a5'
    const iconHeatColor = heating ? activeIconColor:lazyIconColor
    const iconFlowColor = flow ? activeIconColor:lazyIconColor
    const iconAntiFreezeColor = antiFreeze ? activeIconColor:lazyIconColor
    const fault = dpState['fault']

    const tempColor = (!switch_power || fault !== 0) ? '#282828':'#000000'
    
    if (devInfo['productId'] === "nohrp3vbmef7vxvx") {
        productConfig.setTempMin_c = 30;
        productConfig.setTempMax_c = 60;
        productConfig.setTempMin_f = 86;
        productConfig.setTempMax_f = 140;
        productConfig.isShowAntiFreeze = false;
        productConfig.iconWidth = 46;
        productConfig.iconStyle = styles.icon1;
    } else if (devInfo['productId'] === "afvzbrc0qqvgaz8a") {
        productConfig.setTempMin_c = 26;
        productConfig.setTempMax_c = 55;
        productConfig.setTempMin_f = 80;
        productConfig.setTempMax_f = 130;
        productConfig.isShowAntiFreeze = false;
        productConfig.iconWidth = 46;
        productConfig.iconStyle = styles.icon2;
    }

    const setTempMin:number = unit==='c'?productConfig.setTempMin_c:productConfig.setTempMin_f
    const setTempMax:number = unit==='c'?productConfig.setTempMax_c:productConfig.setTempMax_f
    
    const [localTempPrt, setLocalTempPrt] = useState(0);
    
    useEffect(() => {
        setLocalTempPrt(tempToProgress(setTemp))
    }, [setTemp]);

    const tempUnit = () : string => {
        if (unit === "c") {
            return "℃"
        } else if (unit === 'f') {
            return "℉"
        } else {
            return "_ _"
        }
    }

    const subTitle:string = unit==='c'?Strings.getLang('hightTempWarm_c'):Strings.getLang('hightTempWarm_f')
    
    const handleMove = (v: number) => {
        // console.log('handleMove', v);
        setLocalTempPrt(v);
        
    };
    
    const handleEnd = (v: number) => {
        console.warn('handleEnd', v);
        setLocalTempPrt(v);
        directSetTemp(Math.floor(progressToTemp(v)));
    };

    // 进度条值 -> 温度值
    function progressToTemp(progress: number): number {
        return (
            setTempMin +
            (progress) * (setTempMax - setTempMin) / (100)
        );
    }
    
    // 温度值 -> 进度条值
    function tempToProgress(temp: number): number {
        return (
            (temp - setTempMin) * (100) / (setTempMax - setTempMin)
        );
    }

    function directSetTemp(value: number) {
        if (unit==='c') {
            if (value>=50) {
                // if (value == (unit==='c'?temp_c:temp_f)) {return}
                showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
                    success: (params) => {
                        if (params.confirm) {
                            alertSetTemp(value)
                        } else {
                            setLocalTempPrt(Math.floor(tempToProgress(setTemp)))
                        }
                    }
                })
            } else {
                actions['temp_set'].set(value)
            }
        } else {
            if (value>=122) {
                // if (value == (unit==='c'?temp_c:temp_f)) {return}
                showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
                    success: (params) => {
                        if (params.confirm) {
                            alertSetTemp(value)
                        } else {
                            setLocalTempPrt(Math.floor(tempToProgress(setTemp)))
                        }
                    }
                })
            } else {
                actions['temp_set_f'].set(value)
            }
        }
    }

    function alertSetTemp(temp: number) {
        if (unit==='c') {
            actions['temp_set'].set(temp)
        } else {
            actions['temp_set_f'].set(temp)
        }
    }
   
    const cricleView = (
        <View className={styles.newTempView}>
            {/* 圆环背景阴影部份 */}
            <View 
                className={styles.circle}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {switch_power&&<Svg width="100%" height='100%' viewBox='0 0 160 160'>
                    <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                        <feOffset dx="-1" dy="-1" result="offsetblur" />
                        <feFlood flood-color="rgba(168, 164, 164, 0.2)" />
                        <feComposite in2="offsetblur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    </defs>
                    <circle 
                        cx='80' cy='80' r='70' 
                        stroke='rgba(256, 256, 256,1)' 
                        stroke-width='17' fill='none' stroke-dasharray="330,300" stroke-linecap='round' 
                        transform="rotate(135, 80, 80)" 
                        filter='url(#shadow)'
                    />
                </Svg>}
            </View>
            {/* 圆环前景 */}
            <View
                style={{
                    pointerEvents: !switch_power ? 'none' : 'auto', // 根据条件禁用/启用点击事件
                }}
            >
            <RayCircleProgress
                className={styles.circle}
                value={localTempPrt}
                ringRadius={135}
                innerRingRadius={111}
                colorList={[
                    { offset: 0, color: '#295bdd' },
                    { offset: 0.5, color: '#6A53D1' },
                    { offset: 1, color: '#f65028' },
                ]}
                startDegree={135}
                offsetDegree={270}
                touchCircleStrokeStyle={'rgba(0, 0, 0, 0.4)'}
                // thumbBorderColor={'black'}
                thumbBorderWidth={9}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                renderInnerCircle={() => (
                    !switch_power&&
                    <View 
                        style={{width: 565,height: 565}}
                        
                    >
                        <Svg width="100%" height="100%" viewBox="0 0 160 160">
                            <defs>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                                    <feOffset dx="-1" dy="-1" result="offsetblur" />
                                    <feFlood flood-color="rgba(168, 164, 164, 0.2)" />
                                    <feComposite in2="offsetblur" operator="in" />
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="rgba(256,256,256,0.5)"
                                stroke-width="17"
                                fill="none"
                                stroke-dasharray="330,300"
                                stroke-linecap="round"
                                transform="rotate(135, 80, 80)"
                                filter="url(#shadow)"
                            />
                        </Svg>
                    </View>
                )
                }
            />
            </View>
            
            <View className={styles.tempAndIcons}>
                {/* set temperture */}
                <Text className={styles.setTemp} onClick={() => {}}>{Strings.getLang('setTemp')}</Text>
                {/* 温度数值 */}
                <View className={styles.temp} >
                    <Text className={styles.tempNum} style={{color: tempColor}}>{Math.floor(progressToTemp(localTempPrt))}</Text>
                    <Text className={styles.tempUnit} style={{color: tempColor}}>{tempUnit()}</Text>
                </View>
                {/* 状态图标 */}
                <View className={styles.icons}>
                    <Svg className={productConfig.iconStyle} width={productConfig.iconWidth} height={productConfig.iconWidth} viewBox="0 0 20 20">
                        <path fill={iconFlowColor} d='m13.42,11.44c-.41-2.25-.33-3.61-.32-3.71l1.88.14s-.07,1.28.32,3.37c-.61.08-1.24.15-1.89.2m-9.16,1.92c-.3,1.05-.7,2.21-1.24,3.47l1.73.75c.64-1.46,1.09-2.81,1.41-4.01-.65-.06-1.28-.13-1.91-.21m5.74.38c-.32,0-.63-.01-.95-.02v4.52h1.89v-4.52c-.32,0-.62.02-.94.02m5.82-.38c.3,1.05.7,2.21,1.24,3.47l-1.73.75c-.64-1.46-1.09-2.81-1.42-4.01.65-.06,1.29-.13,1.91-.21m-4.87-1.8v-3.75h-1.89v3.75c.32,0,.62.02.95.02s.63-.01.94-.02m-4.29-.12c.41-2.25.32-3.61.32-3.71l-1.89.14s.07,1.28-.32,3.37c.61.08,1.24.15,1.89.2m4.63-7.27V1.77h-2.58v2.38c-3.88.12-6.21.92-6.21.92v1.03h15v-1.03c-2.27-.54-4.36-.8-6.21-.89'></path>
                    </Svg>
                    <Svg className={productConfig.iconStyle} width={productConfig.iconWidth} height={productConfig.iconWidth} viewBox="0 0 20 20">
                        <path fill={iconHeatColor} d="m3.48,18.13l-.46-1.42c.1-.03,2.45-.85,2.45-3.2,0-1.27-.68-2.22-1.39-3.23-.77-1.09-1.57-2.23-1.57-3.79,0-3.18,3.29-4.55,3.43-4.6l.56,1.38s-2.5,1.05-2.5,3.22c0,1.09.6,1.95,1.3,2.93.78,1.1,1.66,2.35,1.66,4.09,0,2.76-2.27,4.23-3.48,4.62Z"/>
                        <path fill={iconHeatColor} d="m8.75,18.13l-.46-1.42c.1-.03,2.45-.85,2.45-3.2,0-1.27-.68-2.22-1.39-3.23-.77-1.09-1.57-2.23-1.57-3.79,0-3.18,3.29-4.55,3.43-4.6l.56,1.38s-2.5,1.05-2.5,3.22c0,1.09.6,1.95,1.3,2.93.78,1.1,1.66,2.35,1.66,4.09,0,2.76-2.27,4.23-3.48,4.62Z"/>
                        <path fill={iconHeatColor} d="m14.02,18.13l-.46-1.42c.1-.03,2.45-.85,2.45-3.2,0-1.27-.68-2.22-1.39-3.23-.77-1.09-1.57-2.23-1.57-3.79,0-3.18,3.29-4.55,3.43-4.6l.56,1.38s-2.5,1.05-2.5,3.22c0,1.09.6,1.95,1.3,2.93.78,1.1,1.66,2.35,1.66,4.09,0,2.76-2.27,4.23-3.48,4.62Z"/>
                    </Svg>
                    <Svg className={productConfig.iconStyle} width={productConfig.iconWidth} height={productConfig.iconWidth} viewBox="0 0 20 20">
                        <path fill={activeIconColor} d="m9.09,15.68l.9,1.48.89-1.46c-.55-.34-1.24-.35-1.8-.01Z"/>
                        <path fill={activeIconColor} d="m13.19,11.94c-1.98-1.11-4.4-1.11-6.38,0l.9,1.48c1.42-.78,3.15-.78,4.57,0l.9-1.48Z"/>
                        <path fill={activeIconColor} d="m15.46,8.22c-3.37-1.96-7.56-1.96-10.93,0l.9,1.48c2.81-1.63,6.29-1.6,9.1.02l.92-1.51Z"/>
                        <path fill={activeIconColor} d="m16.59,6.36l.91-1.48c-4.61-2.72-10.39-2.72-15,.01l.9,1.48c4.06-2.39,9.13-2.4,13.19-.01Z"/>
                    </Svg>
                    {
                        productConfig.isShowAntiFreeze 
                        && 
                        <Svg className={productConfig.iconStyle} width={productConfig.iconWidth} height={productConfig.iconWidth} viewBox="0 0 441.64 529.42">
                            <g>
                                <path fill={iconAntiFreezeColor} fill-rule='nonzero' d="M49.89 301.05l0 -184.09 25 0 0 184.09 0 0 -25 0zm166.22 160.32l9.21 23.24 -9.21 0 -13.65 -5.67 -12.91 -5.82 -12.18 -5.98 -11.46 -6.12 -10.77 -6.23 -10.11 -6.36 -9.44 -6.43 -8.82 -6.5 -8.23 -6.57 -7.63 -6.62 -7.06 -6.64 -6.52 -6.65 -5.98 -6.65 -5.47 -6.61 -5 -6.59 -4.51 -6.53 -4.07 -6.44 -3.65 -6.35 -3.24 -6.24 -2.86 -6.11 -2.49 -5.96 -2.16 -5.78 -1.83 -5.59 -1.55 -5.4 -1.29 -5.18 -1.02 -4.92 -0.81 -4.67 -0.61 -4.41 -0.43 -4.1 -0.28 -3.81 -0.14 -3.48 -0.05 -3.15 25 0 0.03 2.43 0.12 2.74 0.22 3.03 0.35 3.32 0.49 3.57 0.67 3.83 0.84 4.06 1.05 4.28 1.29 4.48 1.55 4.69 1.8 4.86 2.11 5.02 2.42 5.17 2.76 5.32 3.11 5.43 3.51 5.56 3.91 5.65 4.34 5.73 4.81 5.81 5.28 5.87 5.78 5.91 6.32 5.94 6.87 5.96 7.45 5.95 8.06 5.94 8.68 5.91 9.33 5.86 10.01 5.79 10.72 5.72 11.42 5.62 12.19 5.5 12.94 5.37 -9.21 0zm9.21 23.24l-4.6 1.83 -4.61 -1.83 9.21 0zm141.21 -183.55l25 0 0 0 -0.05 3.15 -0.14 3.48 -0.28 3.81 -0.43 4.1 -0.61 4.4 -0.8 4.68 -1.03 4.93 -1.28 5.16 -1.54 5.39 -1.84 5.61 -2.16 5.78 -2.49 5.96 -2.86 6.11 -3.24 6.24 -3.65 6.35 -4.07 6.44 -4.51 6.53 -5 6.58 -5.47 6.62 -5.98 6.65 -6.52 6.65 -7.06 6.64 -7.63 6.61 -8.21 6.57 -8.83 6.51 -9.46 6.44 -10.1 6.34 -10.77 6.24 -11.47 6.11 -12.17 5.98 -12.91 5.82 -13.65 5.67 -9.21 -23.24 12.94 -5.37 12.19 -5.5 11.43 -5.62 10.71 -5.71 10.01 -5.8 9.34 -5.86 8.68 -5.9 8.05 -5.95 7.45 -5.95 6.87 -5.95 6.32 -5.94 5.78 -5.91 5.28 -5.87 4.81 -5.82 4.34 -5.72 3.91 -5.65 3.51 -5.56 3.11 -5.43 2.76 -5.32 2.42 -5.17 2.11 -5.02 1.8 -4.86 1.54 -4.67 1.28 -4.49 1.06 -4.3 0.85 -4.05 0.66 -3.82 0.49 -3.58 0.35 -3.32 0.22 -3.03 0.12 -2.74 0.03 -2.43 0 0zm25 -184.1l0 184.1 -25 0 0 -184.1 12.55 -12.5 12.45 12.5zm-12.45 -12.5l12.45 0.05 0 12.45 -12.45 -12.5zm-150.59 -21.68l-15.57 -19.56 15.57 0.01 1.53 1.16 1.79 1.29 2.05 1.39 2.3 1.48 2.5 1.51 2.77 1.59 2.99 1.64 3.18 1.67 3.41 1.69 3.64 1.72 3.82 1.73 4.03 1.73 4.22 1.73 4.4 1.7 4.59 1.68 4.78 1.64 4.97 1.61 5.14 1.57 5.31 1.52 5.48 1.44 5.63 1.38 5.82 1.3 5.96 1.22 6.11 1.11 6.28 1.02 6.43 0.92 6.56 0.8 6.71 0.67 6.85 0.55 6.98 0.4 7.11 0.26 7.25 0.11 -0.1 25 -7.79 -0.11 -7.65 -0.28 -7.52 -0.44 -7.37 -0.59 -7.23 -0.73 -7.08 -0.86 -6.91 -0.98 -6.76 -1.1 -6.61 -1.21 -6.44 -1.32 -6.28 -1.4 -6.11 -1.48 -5.94 -1.58 -5.75 -1.64 -5.58 -1.69 -5.39 -1.75 -5.22 -1.8 -5.03 -1.84 -4.84 -1.88 -4.64 -1.89 -4.45 -1.91 -4.24 -1.91 -4.04 -1.92 -3.85 -1.91 -3.66 -1.91 -3.41 -1.88 -3.23 -1.85 -3.04 -1.85 -2.79 -1.8 -2.61 -1.75 -2.39 -1.73 -2.21 -1.7 15.57 0.01zm-15.57 -19.56l7.79 -6.2 7.78 6.21 -15.57 -0.01zm-138.03 53.74l-25 0 12.45 -12.5 7.25 -0.11 7.1 -0.26 6.99 -0.41 6.84 -0.54 6.7 -0.68 6.57 -0.8 6.43 -0.92 6.27 -1.02 6.12 -1.12 5.96 -1.22 5.8 -1.29 5.66 -1.39 5.48 -1.44 5.3 -1.51 5.14 -1.57 4.96 -1.6 4.78 -1.66 4.61 -1.68 4.4 -1.7 4.22 -1.73 4.02 -1.71 3.82 -1.74 3.64 -1.71 3.41 -1.7 3.2 -1.66 2.96 -1.63 2.77 -1.6 2.53 -1.53 2.3 -1.47 2.03 -1.38 1.79 -1.29 1.53 -1.17 15.57 19.56 -2.21 1.69 -2.39 1.73 -2.63 1.76 -2.79 1.79 -3.01 1.83 -3.23 1.86 -3.44 1.89 -3.64 1.9 -3.85 1.92 -4.04 1.91 -4.24 1.92 -4.46 1.91 -4.64 1.89 -4.84 1.86 -5.01 1.84 -5.22 1.8 -5.4 1.76 -5.58 1.69 -5.76 1.65 -5.94 1.56 -6.1 1.49 -6.28 1.41 -6.44 1.3 -6.6 1.22 -6.77 1.1 -6.91 0.98 -7.07 0.86 -7.24 0.74 -7.36 0.58 -7.51 0.45 -7.66 0.28 -7.79 0.11 12.45 -12.5zm-25 0l0 -12.45 12.45 -0.05 -12.45 12.5z"/>
                            </g>
                            <g>
                                <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="220.71" y1="166.65" x2="220.71" y2= "388.95" />
                                <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="254.96" y1="181.25" x2="220.71" y2= "215.44" />
                                <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="317.87" y1="223.9" x2="220.71" y2= "272.98" />
                                <polyline fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' points="320.61,261.06 275.94,245.07 289.2,200.14 "/>
                                <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="324.32" y1="325.78" x2="220.71" y2= "272.98" />
                                <polyline fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' points="293.16,348.3 277.69,302.02 324.59,287.38 "/>
                                <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="254.96" y1="371.57" x2="220.71" y2= "337.19" />
                            </g>
                            <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="186.45" y1="181.25" x2="220.71" y2= "215.44" />
                            <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="123.54" y1="223.9" x2="220.71" y2= "272.98" />
                            <polyline fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' points="120.8,261.06 165.47,245.07 152.21,200.14 "/>
                            <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="117.09" y1="325.78" x2="220.71" y2= "272.98" />
                            <polyline fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' points="148.25,348.3 163.72,302.02 116.82,287.38 "/>
                            <line fill='none' stroke={iconAntiFreezeColor} stroke-width='20' stroke-miterlimit='22.9256' x1="186.45" y1="371.57" x2="220.71" y2= "337.19" />
                        </Svg>
                    }
                </View>
            </View>
        </View>
    )

    return (
        cricleView
    )
}
