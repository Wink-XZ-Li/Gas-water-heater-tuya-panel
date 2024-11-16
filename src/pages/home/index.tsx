import React, { useRef, useState } from 'react';
import { Text, View, ScrollView, navigateTo, Map, Image, showModal,Modal, setTabBarStyle, Button, Switch } from '@ray-js/ray';
import { useActions, useDevInfo, useDpSchema, useProps } from "@ray-js/panel-sdk";
import { TopBar } from '@/components';
import styles from './index.module.less';
import TopView from './components/TopView/topView';
import Svg, { Icon } from '@ray-js/svg';
import Slider from '@ray-js/components-ty-slider';
import Strings from '@/i18n';

function Divider() {
  return (<View style={{height: '2px', width: '90%', backgroundColor: '#e9e9e9' }}></View>)
}

const errorInfoText: string[] = ['Normal', 'E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'En'];

export function Home() {
  const dpSchema = useDpSchema();
  const devInfo = useDevInfo();
  const dpState = useProps(state => state);
  const actions = useActions();

  // 产品属性
  const switch_power = dpState["switch"]
  const unit = dpState["temp_unit_convert"]
  const unitText = unit==='c'?'℃':'℉'

  const waterFlow = dpState['water_flow']

  const outletTemp_c = dpState['temp_effluent']
  const outletTemp_f = dpState['temp_effluent_f']
  const outletTemp = unit==='c'?outletTemp_c:outletTemp_f

  const inletTemp_c = dpState['inlet_temp']
  const inletTemp_f = dpState['inlet_temp_f']
  const inletTemp = unit==='c'?inletTemp_c:inletTemp_f

  const temp_c = dpState['temp_set']
  const temp_f = dpState['temp_set_f']
  const setTemp = unit==='c'?temp_c:temp_f

  const work_state: number = dpState['work_state']
  const eco: boolean = dpState['eco']

  const fault: number = dpState['fault']
  const errorInfo = fault<errorInfoText.length?errorInfoText[fault]:'_ _'
  console.log(fault,errorInfo)

  const [tempSetTemp, setTempSetTemp] = useState<number>(setTemp)
  const [isShowTempSetTemp, setIsShowTempSetTemp] = useState<boolean>(false)

  const [reduceOnTouch, setReduceOnTouch] = useState<boolean>(false)
  const [addOnTouch, setAddOnTouch] = useState<boolean>(false)

  const [isPressingAdd, setIsPressingAdd] = useState(false);
  const [isPressingReduce, setIsPressingReduce] = useState(false);

  const powerIconBGColor = switch_power?'#295bdd':'#666666'
  const modeIconBGColor_on = switch_power?"linear-gradient(to right, rgb(53,166,241), rgb(247,18,10))":'rgb(201,201,201)'

  const setTempMin = unit==='c' ? 35 : 95;
  const setTempMax = unit==='c' ? 65 : 149;

  // 长按温度➕
  React.useEffect(() => {
    let timerId;
    var temp = unit==='c'?temp_c:temp_f
    const incrementTemperature = () => {
      console.log("incrementTemperature", temp+1)
      temp+=1
      if (temp===setTempMax+1) {return}
      increaseTemp2(temp)
      timerId = setTimeout(incrementTemperature, 500); // 每100毫秒递增一次温度
    };

    if (isPressingAdd) {
      timerId = setTimeout(incrementTemperature, 500); // 按钮按下后，延迟500毫秒启动递增温度的定时器
    } else {
      clearTimeout(timerId); // 按钮释放后清除定时器
    }

    return () => clearTimeout(timerId); // 组件卸载时清除定时器
  }, [isPressingAdd]);

  // 长按温度➖
  React.useEffect(() => {
    let timerId;
    var temp = unit==='c'?temp_c:temp_f
    const setIsPressingReduce = () => {
      console.log("setIsPressingReduce", temp-1)
      temp-=1
      if (temp===setTempMin-1) {return}
      reduceTemp2(temp)
      timerId = setTimeout(setIsPressingReduce, 500); // 每100毫秒递增一次温度
    };

    if (isPressingReduce) {
      timerId = setTimeout(setIsPressingReduce, 500); // 按钮按下后，延迟500毫秒启动递增温度的定时器
    } else {
      clearTimeout(timerId); // 按钮释放后清除定时器
    }

    return () => clearTimeout(timerId); // 组件卸载时清除定时器
  }, [isPressingReduce]);

  // fault alert
  React.useEffect(() => {
    const binaryFault = fault.toString(2).split('').reverse()
    var title: "title"
    if (fault !== 0) {
      
      if (binaryFault[0]==='1') {

      } else if (binaryFault[1]==='1') {

      } else if (binaryFault[2]==='1') {

      }
      showModal({title: title, content: 'error content', showCancel: false, confirmText: Strings.getLang('confirm')})
    }
  }, [dpState['fault']]);


  // 开关
  function switchPower() {
    actions['switch'].set(!switch_power)
  }

  // 跳转到历史界面
  function navigateToHistory() {
    throttle(() => {
      navigateTo({url: '/pages/history/index'})
    }, 700)()
  }
  
  // 防抖
  function throttle(func, delay) {
    let timer = null;
    return function() {
      if (!timer) {
        timer = setTimeout(() => {
          func.apply(this, arguments);
          timer = null;
        }, delay);
      }
    };
  }

  // 降温
  function reduceTemp() {
    if (unit==='c') {
        actions['temp_set'].set(temp_c-1)
    } else {
      actions['temp_set_f'].set(temp_f-1)
    }
}

  // 降温
  function reduceTemp2(temp:number) {
    if (unit==='c') {
        actions['temp_set'].set(temp)
    } else {
      actions['temp_set_f'].set(temp)
    }
  }

  // 升温
  function increaseTemp2(temp: number) {
    const subTitle:string = unit==='c'?Strings.getLang('hightTempWarm_c'):Strings.getLang('hightTempWarm_f')
    if (unit==='c') {
      if (temp===50) {
        setIsPressingAdd(false)
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm) {actions['temp_set'].set(temp)}
          }
        })
      } else {
        actions['temp_set'].set(temp)
      }
    } else {
      if (temp===122) {
        setIsPressingAdd(false)
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm) {actions['temp_set_f'].set(temp)}
          }
        })
        // clearInterval(timer)
      } else {
        actions['temp_set_f'].set(temp)
      }
    }
  }

  // 升温
  function increaseTemp() {
    const subTitle:string = unit==='c'?Strings.getLang('hightTempWarm_c'):Strings.getLang('hightTempWarm_f')
    if (unit==='c') {
      if (temp_c===49) {
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm) {actions['temp_set'].set(temp_c+1)}
          }
        })
        // clearInterval(timer)
      } else {
        actions['temp_set'].set(temp_c+1)
      }
      
    } else {
      if (temp_f===121) {
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm) {actions['temp_set_f'].set(temp_f+1)}
          }
        })
        // clearInterval(timer)
      } else {
        actions['temp_set_f'].set(temp_f+1)
      }
    }
  }

  // 升降温按钮禁用
  const disableReduce = (unit==='c'?Boolean(temp_c<=35):Boolean(temp_f<=95))||!switch_power
  const disableAdd = (unit==='c'?Boolean(temp_c>=65):Boolean(temp_f>=149))||!switch_power
  const disableMode = !switch_power

  return (
    <View className={styles.view}>
      <TopBar />
      <ScrollView scrollY={true} className={styles.content}>

        {/* 品牌 示意图 型号 */}
        <TopView/>

        {/* 状态 */}
        <View className={`${styles.stateAndControlSection} ${styles.baseSection}`} style={{marginTop: '15px'}}>
          <View className={styles.sectionTitle} id='state'>
            <Svg className={styles.sectionTitleLogo}  width='40' height='40' viewBox="0 0 11.31 14.46">
              <path fill='black' fill-rule='nonzero' d="M3.05 3.15l5.21 0 0 0.96 -5.21 0 0 -0.96zm0 2.92l5.21 0 0 0.96 -5.21 0 0 -0.96zm0 2.92l3.8 0 0 0.96 -3.8 0 0 -0.96zm6.43 5.46l-7.65 0c-0.51,0 -0.96,-0.21 -1.29,-0.54 -0.33,-0.33 -0.54,-0.79 -0.54,-1.29l0 -10.79c0,-0.51 0.21,-0.96 0.54,-1.29 0.33,-0.33 0.79,-0.54 1.29,-0.54l7.65 0c0.51,0 0.96,0.21 1.29,0.54 0.33,0.33 0.54,0.79 0.54,1.29l0 10.79c0,0.51 -0.21,0.96 -0.54,1.29 -0.33,0.33 -0.79,0.54 -1.3,0.54zm-7.65 -13.49c-0.24,0 -0.46,0.1 -0.61,0.25 -0.16,0.16 -0.25,0.37 -0.25,0.61l0 10.79c0,0.24 0.1,0.46 0.25,0.61 0.16,0.16 0.37,0.25 0.61,0.25l7.65 0c0.24,0 0.46,-0.1 0.61,-0.25 0.16,-0.16 0.25,-0.37 0.25,-0.61l0 -10.79c0,-0.24 -0.1,-0.46 -0.25,-0.61 -0.16,-0.16 -0.37,-0.25 -0.61,-0.25l-7.65 0z"/>
            </Svg>
            <View className={styles.sectionTitleText}>State</View>
          </View>
          
          <View className={styles.sectionItem} id='错误信息'>
            <View className={styles.sectionItemText}>Error Info</View>
            <View className={styles.sectionItemText}>{errorInfo}</View>
          </View>
          <Divider/>
          <View className={styles.sectionItem} id='设置温度'>
            <View className={styles.sectionItemText}>Domestic Outlet Set Temp.</View>
            <View className={styles.sectionItemText}>{setTemp+' '+unitText}</View>
          </View>
          <Divider/>
          <View className={styles.sectionItem} id='出水温度'>
            <View className={styles.sectionItemText}>Domestic Outlet Temp.</View>
            <View className={styles.sectionItemText}>{outletTemp+' '+unitText}</View>
          </View>
          <Divider/>
          <View className={styles.sectionItem} id='进水温度'>
            <View className={styles.sectionItemText}>Inlet Temp.</View>
            <View className={styles.sectionItemText}>{inletTemp+' '+unitText}</View>
          </View>
          <Divider/>
          <View className={styles.sectionItem} id='水流速度'>
            <View className={styles.sectionItemText}>Domestic Flow Rate</View>
            <View className={styles.sectionItemText}>{waterFlow+' GPM'}</View>
          </View>
        </View>

        {/* 控制 */}
        <View className={`${styles.stateAndControlSection} ${styles.baseSection}`}>
          <View className={styles.sectionTitle} id='control'>
            <Svg className={styles.sectionTitleLogo}  width='40' height='40' viewBox="0 0 13.95 15.48">
            <g>
              <path fill='black' fill-rule='nonzero' d="M6.87 1.87l7.08 0 0 1.01 -7.07 0c0.06,-0.15 0.09,-0.32 0.09,-0.49 0,-0.18 -0.03,-0.36 -0.1,-0.52zm-2.55 0c-0.06,0.16 -0.1,0.33 -0.1,0.52 0,0.17 0.03,0.34 0.09,0.49l-4.31 0 0 -1.01 4.32 0zm7.18 5.43l2.44 0 0 1.01 -2.44 0c0.06,-0.16 0.1,-0.33 0.1,-0.5 0,-0.17 -0.03,-0.35 -0.1,-0.51zm-2.56 0c-0.06,0.16 -0.1,0.33 -0.1,0.51 0,0.18 0.03,0.35 0.1,0.5l-8.94 0 0 -1.01 8.94 0zm-3.98 5.29l8.98 0 0 1.01 -8.98 0c0.06,-0.16 0.1,-0.33 0.1,-0.51 0,-0.18 -0.03,-0.35 -0.1,-0.51zm-2.56 0c-0.06,0.16 -0.1,0.33 -0.1,0.51 0,0.18 0.03,0.35 0.1,0.51l-2.41 0 0 -1.01 2.41 0z"/>
              <path fill='black' fill-rule='nonzero' d="M6.97 2.39c0,-0.76 -0.61,-1.38 -1.37,-1.38 -0.76,0 -1.37,0.62 -1.37,1.38 0,0.76 0.62,1.38 1.37,1.38 0.76,0 1.37,-0.62 1.37,-1.38zm4.63 5.42c0,-0.76 -0.62,-1.38 -1.38,-1.38 -0.76,0 -1.37,0.62 -1.37,1.38 0,0.76 0.62,1.38 1.37,1.38 0.76,0 1.38,-0.62 1.38,-1.38zm-6.54 5.28c0,-0.76 -0.62,-1.38 -1.37,-1.38 -0.76,0 -1.37,0.62 -1.37,1.38 0,0.76 0.61,1.38 1.37,1.38 0.76,0 1.37,-0.62 1.37,-1.38zm2.92 -10.7c0,1.32 -1.07,2.39 -2.39,2.39 -1.32,0 -2.39,-1.07 -2.39,-2.39 0,-1.32 1.07,-2.39 2.39,-2.39 1.32,0 2.39,1.07 2.39,2.39zm4.63 5.42c0,1.32 -1.07,2.39 -2.39,2.39 -1.32,0 -2.39,-1.07 -2.39,-2.39 0,-1.32 1.07,-2.39 2.39,-2.39 1.32,0 2.39,1.07 2.39,2.39zm-6.54 5.28c0,1.32 -1.07,2.39 -2.39,2.39 -1.32,0 -2.39,-1.07 -2.39,-2.39 0,-1.32 1.07,-2.39 2.39,-2.39 1.32,0 2.39,1.07 2.39,2.39z"/>
            </g>
            </Svg>
            <View className={styles.sectionTitleText}>Control</View>
          </View>

          <View className={styles.sectionItem} id='电源'>
            <View className={styles.sectionItemText}>Power ON/OFF</View>
            <Switch 
              color='#d3233b' 
              checked={switch_power}
              onChange={ e =>
                actions['switch'].set(e.detail.value)
              }
            />
          </View>

          <Divider/>

          <View className={styles.sectionItem} id='eco'>
            <View className={styles.sectionItemText}>ECO</View>
            <Switch 
              color='#d3233b' 
              checked={eco}
              disabled={disableMode}
              onChange={ e =>
                actions['eco'].set(e.detail.value)
              }
            />
          </View>
          
          <Divider/>
          <View style={{width: '90%', fontSize: 'normal', marginTop: '8px', marginBottom: '8px'}}>Temperature Regulation</View>
          <View className={styles.tempNumRow} id='温度数值' >
            <Text className={styles.tempUnit} style={{opacity: 0}} >{unitText}</Text>
            <Text className={styles.tempNum} >{isShowTempSetTemp?tempSetTemp:setTemp}</Text>
            <Text className={styles.tempUnit} >{unitText}</Text>
          </View>

          {/* 调温度 */}
          <View className={styles.titleSection_content} style={{paddingTop: '0px', paddingBottom: '15px'}} >
            <View className={styles.setTempButton}>
              <Button 
                className={styles.button}
                onClick={reduceTemp} 
                disabled={disableReduce}
                onLongClick={() => {
                  setIsPressingReduce(true)
                }}
                onTouchStart={() => {setReduceOnTouch(true)}}
                onTouchEnd={() => {
                  setReduceOnTouch(false)
                  setIsPressingReduce(false)
                }}
              >
                <View style={{backgroundColor: '#e1e1e1', borderRadius: '50%'}}>
                  <Svg viewBox="0 0 7.04 0.63" width='34px' height='34px' style={{padding: '10px'}}>
                    <path d="M0.32 0.63c-0.17,0 -0.32,-0.14 -0.32,-0.32 0,-0.17 0.14,-0.32 0.32,-0.32l6.41 0c0.17,0 0.32,0.14 0.32,0.32 0,0.17 -0.14,0.32 -0.32,0.32l-6.41 0z"
                      fill={disableReduce?'#C9C9C9':'#000000'}
                      stroke-width={reduceOnTouch?"60":"20"}
                    ></path>
                  </Svg>
                </View>
              </Button>
            </View>
            
            <View className={styles.sectionItem_Slider}>
              <Slider
                step={1}
                value={setTemp}
                min={setTempMin}
                max={setTempMax}
                maxTrackHeight='34px'
                maxTrackRadius='17px'
                maxTrackColor='rgb(225,225,225)'
                minTrackColor={modeIconBGColor_on}
                minTrackHeight='34px'
                parcel={true}
                thumbWidth={26}
                thumbHeight={26}
                thumbStyle={{marginRight:'4px',marginLeft:'4px'}}
                disabled={disableMode}
                onBeforeChange={(e) => {
                  setIsShowTempSetTemp(true)
                }}
                onChange={(e) => {
                  setTempSetTemp(e)
                }}
                onAfterChange={(e) => {
                  if (unit==='c') {
                    actions['temp_set'].set(e)
                  } else {
                    actions['temp_set_f'].set(e)
                  }
                  
                  setTimeout(() => {
                    setIsShowTempSetTemp(false)
                  }, 500)
                }}
              />
            </View>

            <View className={styles.setTempButton}>
              <Button 
                className={styles.button}
                onClick={increaseTemp} 
                disabled={disableAdd}
                onLongClick={() => {
                  setIsPressingAdd(true)
                }}
                onTouchStart={() => {setAddOnTouch(true)}}
                onTouchEnd={() => {
                  setAddOnTouch(false)
                  setIsPressingAdd(false)
                }}
              >
                <View style={{backgroundColor: '#e1e1e1', borderRadius: '50%'}}>
                  <Svg viewBox="0 0 5.31 5.31" width='34px' height='34px' style={{padding: '10px'}}>
                    <path d="M0.24 2.89c-0.13,0 -0.24,-0.11 -0.24,-0.24 0,-0.13 0.11,-0.24 0.24,-0.24l2.18 0 0 -2.18c0,-0.13 0.11,-0.24 0.24,-0.24 0.13,0 0.24,0.11 0.24,0.24l0 2.18 2.18 0c0.13,0 0.24,0.11 0.24,0.24 0,0.13 -0.11,0.24 -0.24,0.24l-2.18 0 0 2.18c0,0.13 -0.11,0.24 -0.24,0.24 -0.13,0 -0.24,-0.11 -0.24,-0.24l0 -2.18 -2.18 0z" 
                      fill={disableAdd?'#C9C9C9':'#000000'}
                      stroke-width={addOnTouch?"60":"20"}
                    >
                    </path>
                  </Svg>
                </View>
              </Button>
            </View>
          </View>
        </View>

        {/* 图表 */}
        <View className={`${styles.stateAndControlSection} ${styles.baseSection}`} style={{marginTop: '15px'}}>
          <Button className={styles.sectionBtn}>
            
            <View className={styles.sectionTitle} style={{marginBottom: '5%'}}>
              <Svg className={styles.sectionTitleLogo}  width='40' height='40' viewBox="0 0 14.83 14.86">
                <path fill='black' fill-rule='nonzero' d="M14.83 13.75l-13.71 0 0 -13.7 -1.12 -0.05 0 14.36c0.03,0.28 0.27,0.51 0.56,0.51 0.01,0 0.02,0 0.03,-0l14.24 0 0 -1.12z"/>
                <path fill='black' fill-rule='nonzero' d="M11.67 2.65l1.8 0 0 10.33 -1.8 0 0 -10.33zm-3.17 4.63l1.8 0 0 5.7 -1.8 0 0 -5.7zm-3.17 -1.46l1.8 0 0 7.16 -1.8 0 0 -7.16zm-3.17 3.41l1.8 0 0 3.75 -1.8 0 0 -3.75z"/>
              </Svg>
              <Text className={styles.sectionTitleText}>Consumption Report</Text>
            </View>

            <Svg style={{marginRight: '5%',  width: '49px', height:'19px'}} viewBox="0 0 5.17 9.44">
              <path fill='black' fill-rule='nonzero' d="M5.04 4.44l-4.56 -4.44 -0.47 0.48 4.37 4.24 -4.37 4.24 0.47 0.49 4.57 -4.45c0.02,-0.02 0.05,-0.05 0.06,-0.07 0.11,-0.18 0.07,-0.34 -0.07,-0.49z"/>
            </Svg>
            
          </Button>
        </View>
      </ScrollView>
    </View>
    );
}

export default Home;