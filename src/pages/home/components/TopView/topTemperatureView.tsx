import React, { useState, useEffect } from 'react';
import { Text, View, Button, Picker, showModal, vibrateShort } from '@ray-js/ray';
import {Svg, Icon} from '@ray-js/svg';
import { useActions, useDevInfo, useDpSchema, useProps } from "@ray-js/panel-sdk";
import styles from './topTemperatureView.module.less';
import Strings from '@/i18n';
import RayCircleProgress from '@ray-js/circle-progress';
import { fahrenheitTemps } from '../..';

interface ChildComponentProps {
    localTempPrt: number; // 状态值
    setLocalTempPrt: React.Dispatch<React.SetStateAction<number>>; // 更新函数
    // setIsShowLocalTemp: React.Dispatch<React.SetStateAction<boolean>>; // 更新函数
}

export default function TopTemperatureView(prob: ChildComponentProps) {
    // 使用useDpSchema获取dpSchema
    const dpSchema = useDpSchema();
    // 使用useDevInfo获取devInfo
    const devInfo = useDevInfo();
    const dpState = useProps(state => state); // 获取所有dpState
    const actions = useActions();

    const switch_power = dpState["switch"]
    const unit = dpState["temp_unit_convert"]
    const temp_c = dpState['temp_set']
    const temp_f = dpState['temp_set_f']
    const outletTemp_c = dpState['temp_effluent']
    const outletTemp_f = dpState['temp_effluent_f']
    const outletTemp = unit==='c'?outletTemp_c:outletTemp_f

    const setTemp = unit==='c'?temp_c:temp_f

    const [tempForBug,setTempForBug] = useState(setTemp)

    const fault = dpState['fault']

    const tempColor = (!switch_power || fault !== 0) ? '#282828':'#000000'
    
    const setTempMin = unit==='c' ? 35 : 95;
    const setTempMax = unit==='c' ? 65 : 149;

    const disable = !switch_power || (fault !== 0)
    
    useEffect(() => {
        prob.setLocalTempPrt(tempToProgress(setTemp))
        setTempForBug(setTemp)
        console.log('setTempForBug: ', tempForBug);
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
    
    // 处理温度环移动事件
    const handleMove = (v: number) => {
        // prob.setIsShowLocalTemp(true);
        // 设置本地温度
        prob.setLocalTempPrt(v)
        
    };
    
    // 处理温度环结束函数
    const handleEnd = (v: number) => {
        // prob.setIsShowLocalTemp(false);
        // 设置本地温度
        prob.setLocalTempPrt(v)
        // 根据进度设置温度
        directSetTemp(Math.floor(progressToTemp(v)));
    };

    // 进度条值 -> 温度值
    function progressToTemp(progress: number): number {
        if (unit==='c') {
            return Math.floor(
                setTempMin +
                (progress) * (setTempMax - setTempMin) / (100)
            )
        } else {
            const index = Math.round(progress / 100 * (fahrenheitTemps.length - 1));
            return fahrenheitTemps[index];
        }
    }
    
    // 温度值 -> 进度条值
    function tempToProgress(temp: number): number {
        if (unit==='c') {
            return (
                (temp - setTempMin) * (100) / (setTempMax - setTempMin)
            );
        } else {
            const index = fahrenheitTemps.indexOf(temp);
            return index !== -1 ? (index / (fahrenheitTemps.length - 1)) * 100 : 0;
        }
    }

    function directSetTemp(value: number) {
        if (unit==='c') {
            if (value>=49) {
                // showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
                //     success: (params) => {
                //         if (params.confirm) {
                //             alertSetTemp(value)
                //         } else if (params.cancel) {
                //             console.log('tempForBug: ', tempForBug);
                //             prob.setLocalTempPrt(Math.floor(tempToProgress(tempForBug)))
                //         }
                //     }
                // })
                showModal({title: '', content: subTitle, showCancel: false, confirmText: Strings.getLang('yes'), 
                    success: (params) => {
                        if (params.confirm) {
                            alertSetTemp(value)
                        }
                    }
                })
            } else {
                actions['temp_set'].set(value)
            }
        } else {
            if (value>=120) {
                // showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
                //     success: (params) => {
                //         if (params.confirm) {
                //             alertSetTemp(value)
                //         } else {
                //             prob.setLocalTempPrt(Math.floor(tempToProgress(setTemp)))
                //         }
                //     }
                // })
                showModal({title: '', content: subTitle, showCancel: false, confirmText: Strings.getLang('yes'), 
                    success: (params) => {
                        if (params.confirm) {
                            alertSetTemp(value)
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
                {!disable&&<Svg width="100%" height='100%' viewBox='0 0 160 160'>
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
                    pointerEvents: disable ? 'none' : 'auto', // 根据条件禁用/启用点击事件
                }}
            >
            <RayCircleProgress
                className={styles.circle}
                value={prob.localTempPrt}
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
                    disable&&
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
            
            {/* logo */}
            <View className={styles.tempAndIcons}>
                <BrandView/>
                {/* set temperture */}
                <Text className={styles.setTemp} onClick={() => {}}>Outlet Temp</Text>
                {/* 温度数值 */}
                <View className={styles.temp} >
                <Text className={styles.tempUnit} style={{opacity: 0}}>{tempUnit()}</Text>
                    <Text className={styles.tempNum} style={{color: tempColor}}>{(outletTemp || '_ _')}</Text>
                    <Text className={styles.tempUnit} style={{color: tempColor}}>{tempUnit()}</Text>
                </View>
            </View>
        </View>
    )

    return (
        cricleView
    )
}

function BrandView() {
    const devInfo = useDevInfo();
    if (devInfo['productId'] === "zb7g4ffimeyqwvxt") {
        return(<Svg width='200' height='100' className={styles.brand} viewBox="0 0 3620.64 352.8">
            <g>
                <polygon fill='#D42942' fill-rule='nonzero' points="927.59,0.02 804.87,346.1 598.98,346.1 708.27,63.73 452.09,346.1 320.61,346.1 256.23,59.71 165.67,346.1 -0,346.1 122.1,0.02 416.53,0.02 464.12,179.76 631.16,0.02 "/>
                <polygon fill='#D42942' fill-rule='nonzero' points="1203.02,0.02 1078.91,346.1 867.68,346.1 991.74,0.02 "/>
                <polygon fill='#D42942' fill-rule='nonzero' points="1736.81,268.96 1711.3,346.11 1149.29,346.11 1172.78,274.99 1530.92,75.14 1256.6,75.14 1281.44,0 1809.27,0 1787.11,65.05 1420.22,268.96 "/>
                <path fill='#D42942' fill-rule='nonzero' d="M2432.68 0.02l-71.08 213.92c-12.07,36.23 -28.08,63.08 -47.95,80.51 -19.89,17.43 -52.67,31.5 -98.24,42.23 -45.62,10.76 -99.95,16.12 -162.99,16.12 -81.84,0 -145.55,-8.72 -191.13,-26.14 -45.62,-17.47 -68.44,-42.48 -68.44,-75.14 0,-11.19 2.47,-23.68 7.37,-37.58l71.12 -213.92 210.57 0 -70.41 213.92c-4.02,11.68 -6.03,20.4 -6.03,26.18 0,10.3 8.5,18.59 25.47,24.84 17,6.24 37.32,9.34 61.06,9.34 30.38,0 53.31,-3.77 68.72,-11.35 15.46,-7.62 26.96,-22.83 34.54,-45.62l72.43 -217.31 164.99 0z"/>
                <path fill='#D42942' fill-rule='nonzero' d="M2390.1 346.1l107.32 -346.08 213.96 0c51.4,0 93.23,2.01 125.41,6.03 32.21,4.02 63.39,12.74 93.55,26.14 30.24,13.44 52.99,30.66 68.44,51.69 15.42,20.99 23.11,44.69 23.11,71.08 0,33.97 -11.85,64.63 -35.56,91.86 -23.67,27.27 -54.86,48.86 -93.52,64.74 -38.7,15.87 -76.45,25.61 -113.35,29.17 -36.9,3.6 -88.44,5.37 -154.62,5.37l-234.74 0zm215.97 -77.79l0 0 42.93 0c45.62,0 79.24,-3.49 100.93,-10.41 21.66,-6.91 40.36,-19.79 56.03,-38.56 15.62,-18.77 23.45,-41.59 23.45,-68.4 0,-51.01 -35.98,-76.48 -107.98,-76.48l-55.67 0 -59.69 193.85z"/>
                <path fill='#D42942' fill-rule='nonzero' d="M3320.85 346.75c-68.37,0 -127.64,-12.73 -177.73,-38.2 -50.09,-25.51 -75.14,-62.16 -75.14,-110 0,-55 28.08,-101.81 84.17,-140.55 56.13,-38.63 129.58,-57.99 220.35,-57.99 72.42,0 131.86,13.54 178.4,40.6 46.49,27.06 69.74,62.27 69.74,105.59 0,55.91 -27.59,103.33 -82.83,142.2 -55.21,38.91 -127.53,58.35 -216.96,58.35zm1.34 -76.45l0 0c29.99,0 52.74,-7.26 68.44,-21.8 15.59,-14.5 27.94,-35.77 36.86,-63.71 8.93,-27.94 13.41,-46.81 13.41,-56.69 0,-16.51 -6.81,-29.14 -20.46,-37.85 -13.62,-8.75 -31.86,-13.09 -54.65,-13.09 -42.93,0 -73.23,17.11 -90.87,51.29 -17.68,34.19 -26.5,64.53 -26.5,90.91 0,33.94 24.59,50.94 73.77,50.94z"/>
            </g>
        </Svg>)
    } else if (devInfo['productId'] === "bnqtq87x3yuxg6nf") {
        return (<View>FOGATTI</View>)
    } else if (devInfo['productId'] === "uaaxd0vrmf3ez9zm") {
        return (<View>ORBK</View>)
    } else if (devInfo['productId'] === "hlma4dxmjjsiicjg") {
        return (<View>Westinghouse</View>)
    } else if (devInfo['productId'] === "avkomece5wvqrhlh") {
        return (<View/>)
    } else if (devInfo['productId'] === "iepip6u1zyet9up1") {
        return (<View/>)
    } else {
        return (<View/>)
    }
}