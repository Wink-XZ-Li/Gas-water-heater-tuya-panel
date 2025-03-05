import React, { useRef, useState, useEffect } from 'react';
import { Text, View, ScrollView, navigateTo, Map, Image, showModal,Modal, setTabBarStyle, Button, Switch, getCurrentPages } from '@ray-js/ray';
import { useActions, useDevInfo, useDpSchema, useProps } from "@ray-js/panel-sdk";
import { TopBar } from '@/components';
import styles from './index.module.less';
import Svg, { Icon } from '@ray-js/svg';
import Slider from '@ray-js/components-ty-slider';
import Strings from '@/i18n';
import TopTemperatureView from './components/TopView/topTemperatureView';

function Divider() {
  return (<View style={{height: '2px', width: '90%', backgroundColor: '#e9e9e9' }}></View>)
}

const errorMap = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'En'];

export const fahrenheitTemps = [95,96,98,100,102,104,105,107,109,111,113,114,116,118,120,122,123,125,127,129,131,132,134,136,138,140,141,143,145,147,149]


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

  // const outletTemp_c = dpState['temp_effluent']
  // const outletTemp_f = dpState['temp_effluent_f']
  // const outletTemp = unit==='c'?outletTemp_c:outletTemp_f

  const inletTemp_c = dpState['inlet_temp']
  const inletTemp_f = dpState['inlet_temp_f']
  const inletTemp = unit==='c'?inletTemp_c:inletTemp_f

  const temp_c = dpState['temp_set']
  const temp_f = dpState['temp_set_f']
  const setTemp = unit==='c'?temp_c:temp_f
  // const [localTemp, setLocalTemp] = useState(setTemp); // 本地状态管理滑块值

  const [localTempPrt, setLocalTempPrt] = useState(0);

  const work_state: number = dpState['work_state']
  const eco: boolean = dpState['eco']

  const fault: number = dpState['fault']
  const [errorInfo, setErrorInfo] = useState<string>('Normal')

  const [reduceOnTouch, setReduceOnTouch] = useState<boolean>(false)
  const [addOnTouch, setAddOnTouch] = useState<boolean>(false)

  const [isPressingAdd, setIsPressingAdd] = useState(false);
  const [isPressingReduce, setIsPressingReduce] = useState(false);

  const [isShowLocalTemp, setIsShowLocalTemp] = useState(false);

  const modeIconBGColor_on = (switch_power && fault === 0)?"linear-gradient(to right, rgb(53,166,241), rgb(247,18,10))":'rgb(201,201,201)'

  const setTempMin = unit==='c' ? 35 : 95;
  const setTempMax = unit==='c' ? 65 : 149;

  const powerIconBGColor = switch_power?'#295bdd':'#666666'
  const ecoColor = eco?'#295bdd':'#666666'
  // useEffect(() => {
  //   setLocalTemp(setTemp);
  // }, [setTemp]);


  // 进度条值 -> 温度值
  function progressToTemp(progress: number): number {
    if (unit==='c') {
        return Math.floor(
            setTempMin +
            (progress) * (setTempMax - setTempMin) / (100)
        )
    } else {
        const index = Math.round(progress / 100 * (fahrenheitTemps.length - 1));
        console.log('log: fahrenheitTemps', fahrenheitTemps[index])
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

  // 长按温度➕
  React.useEffect(() => {
    let timerId;
    var temp = unit==='c'?temp_c:temp_f
    const incrementTemperature = () => {
      if (unit==='c') {
        temp+=1
      } else {
        const index = fahrenheitTemps.indexOf(temp);
        if (index<fahrenheitTemps.length) {
          temp = fahrenheitTemps[index+1]
        }
      }
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
      if (unit==='c') {
        temp-=1
      } else {
        const index = fahrenheitTemps.indexOf(temp);
        if (index>=1) {
          temp = fahrenheitTemps[index-1]
        }
      }
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

  // 跳转到历史界面
  function navigateToHistory() {
    const pages: Array<object> = getCurrentPages()
    if (pages[pages.length-1].pageId === 'page_0') {
      navigateTo({url: '/pages/history/index'})
    }
    console.log(pages)
  }

  // 降温
  function reduceTemp() {
    if (unit==='c') {
      actions['temp_set'].set(temp_c-1)
    } else {
      const index = fahrenheitTemps.indexOf(temp_f);
      if (index>=1) {
        console.log('reduceTemp', fahrenheitTemps[index-1])
        actions['temp_set_f'].set(fahrenheitTemps[index-1])
      }
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
    const subTitle:string = 'The setting temperature has exceeded 49℃/120℉. Please confirm.'//unit==='c'?Strings.getLang('hightTempWarm_c'):Strings.getLang('hightTempWarm_f')
    if (unit==='c') {
      if (temp===49) {
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
      if (temp===120) {
        setIsPressingAdd(false)
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm) {actions['temp_set_f'].set(temp)}
          }
        })
      } else {
        actions['temp_set_f'].set(temp)
      }
    }
  }

  // 升温
  function increaseTemp() {
    const subTitle:string =  'The setting temperature has exceeded 49℃/120℉. Please confirm.'// = unit==='c'?Strings.getLang('hightTempWarm_c'):Strings.getLang('hightTempWarm_f')
    if (unit==='c') {
      if (temp_c===49) {
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm) {actions['temp_set'].set(temp_c+1)}
          }
        })
      } else {
        actions['temp_set'].set(temp_c+1)
      }
    } else {
      const index = fahrenheitTemps.indexOf(temp_f);
      if (temp_f===120) {
        showModal({title: '', content: subTitle, showCancel: true, cancelText: Strings.getLang('no'), confirmText: Strings.getLang('yes'), 
          success: (params) => {
            if (params.confirm && index<fahrenheitTemps.length) {
              actions['temp_set_f'].set(fahrenheitTemps[index+1])
            }
          }
        })
      } else {
        if (index<fahrenheitTemps.length) {
          console.log('increaseTemp', fahrenheitTemps[index+1])
          actions['temp_set_f'].set(fahrenheitTemps[index+1])
        }
      }
    }
  }

  // 开关
  function switchPower() {
    actions['switch'].set(!switch_power)
  }

  function switchECO() {
    if (fault!==0) {
      return
    }
    if (eco) {
      actions['eco'].set(false)
    } else {
      actions['eco'].set(true)
    }
  }

  // fault alert
  React.useEffect(() => {
    const binaryFault = fault.toString(2).split('').reverse()
    var content = '';
    if (fault !== 0) {
      const faultIndex = binaryFault.findIndex(bit => bit === '1');
      const errorIndex = faultIndex !== -1 && faultIndex < errorMap.length ? errorMap[faultIndex] : null;
      if (errorIndex == null) {
        return
      }
      const titleStr = "Error Code : "+errorIndex
      const contentStr = errorIndex+'Content'
      setErrorInfo(errorIndex)
      content = Strings.getLang(contentStr)
      showModal({title: titleStr, content: content, showCancel: false, confirmText: Strings.getLang('confirm')})
    } else {
      setErrorInfo('Normal');
    }
  }, [dpState['fault']]);

  // 升降温按钮禁用
  const disableReduce = (unit==='c'?Boolean(temp_c<=35):Boolean(temp_f<=95)) || !switch_power || (fault !== 0)
  const disableAdd = (unit==='c'?Boolean(temp_c>=65):Boolean(temp_f>=149)) || !switch_power || (fault !== 0)
  const disableMode = !switch_power || (fault !== 0)
  const disablePower =  (fault !== 0)

  return (
    <View className={styles.view}>
      <TopBar />
      <ScrollView scrollY={true} className={styles.content}>
      <TopTemperatureView localTempPrt={localTempPrt} setLocalTempPrt={setLocalTempPrt}/>
      <View className={styles.roSection}>
          
          {/* <View style={{backgroundColor: '#f2f2f2', width: '2px', height: '80%'}}></View> */}
          <View className={styles.sectionItem} >
            <View>
              <Text className={styles.sectionItemContentRO}>{(inletTemp || '_ _')}</Text>
              <Text className={styles.sectionItemContentROUnit}>{unitText}</Text>
            </View>
            <Text className={styles.sectionItemTitle}>Inlet Temp</Text>
          </View>

          <View className={styles.sectionItem} >
            <View>
              <Text className={styles.sectionItemContentRO}>{progressToTemp(localTempPrt)}</Text>
              <Text className={styles.sectionItemContentROUnit}>{unitText}</Text>
            </View>
            <Text className={styles.sectionItemTitle}>Set Temp</Text>
          </View>

          <View className={styles.sectionItem}>
            <View>
              <Text className={styles.sectionItemContentRO}>{(waterFlow/10 || '_ _')}</Text>
              <Text className={styles.sectionItemContentROUnit}>{'GPM'}</Text>
            </View>
            <Text className={styles.sectionItemTitle}>Water Flow</Text>
          </View>
        </View>

        {/* 加减按钮 */}
        <View className={styles.rwSection}>
          <View className={styles.sectionItem}>
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
              <Svg viewBox="0 0 1024 1024" width='31px' height='31px'>
                <path d="M917.7088 491.7248 107.008 491.7248c-11.776 0-21.2992 9.6256-21.2992 21.2992s9.6256 21.2992 21.2992 21.2992l810.7008 0c11.776 0 21.2992-9.6256 21.2992-21.2992S929.3824 491.7248 917.7088 491.7248z"
                  fill={disableReduce?'#a7a7a7':'rgb(102,102,102)'}
                  stroke={disableReduce?'#a7a7a7':'rgb(102,102,102)'}
                  stroke-width={reduceOnTouch?"60":"20"}
                ></path>
              </Svg>
            </Button>
          </View>
          <View style={{backgroundColor: '#f2f2f2', width: '2px', height: '80%'}}></View>
          <View className={styles.sectionItem}>
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
              <Svg viewBox="0 0 1024 1024" width='31px' height='31px'>
                <path d="M910.509 490.415h-378.843v-376.925c0-11.2-9.427-20.281-20.626-20.281s-20.626 9.08-20.626 20.281v376.925h-376.925c-11.2 0-20.281 9.426-20.281 20.626s9.08 20.626 20.281 20.626h376.925v378.844c0 11.199 9.427 20.281 20.626 20.281 11.199 0 20.626-9.081 20.626-20.281v-378.844h378.843c11.199 0 20.281-9.426 20.281-20.626s-9.081-20.626-20.281-20.626z" 
                  fill={disableAdd?'#a7a7a7':'rgb(102,102,102)'}
                  stroke={disableAdd?'#a7a7a7':'rgb(102,102,102)'}
                  stroke-width={addOnTouch?"60":"20"}
                >
                </path>
              </Svg>
            </Button>
          </View>
        </View>
        {/* 单位、开关 */}
        <View className={styles.rwSection}>
          <View className={styles.sectionItem}>
            <Button 
            className={styles.button}
            onClick={switchECO} 
            disabled={disableMode}
            >
              {disableMode&&<Text className={styles.sectionItemContent}>ECO</Text>}
              {!disableMode&&<Text className={styles.sectionItemContent} style={{color: ecoColor}}>ECO</Text>}
            </Button>
          </View>
          <View style={{backgroundColor: '#f2f2f2', width: '2px', height: '80%'}}></View>
          <View className={styles.sectionItem}>
            <Button 
              className={styles.button}
              onClick={switchPower} 
              disabled={disablePower}
            >
              <Svg className={switch_power?styles.powerIconOn:styles.powerIconOff}width='44px' height='44px' style={{backgroundColor: powerIconBGColor, padding: '8px', borderRadius: '50%',  paddingTop: '7px', paddingBottom: '9px' }} viewBox="0 0 10.31 11.3">
                <path fill='#FFFFFF' stroke-width='20' fill-rule='nonzero' d="M5.16 6.66c-0.18,0 -0.33,-0.15 -0.33,-0.33l0 -5.99c0,-0.18 0.15,-0.33 0.33,-0.33 0.18,0 0.33,0.15 0.33,0.33l0 5.99c0,0.18 -0.15,0.33 -0.33,0.33zm0 4.64c-2.84,0 -5.16,-2.32 -5.16,-5.16 0,-2.11 1.27,-4 3.23,-4.78 0.17,-0.07 0.36,0.01 0.43,0.18 0.07,0.17 -0.01,0.36 -0.18,0.43 -1.71,0.69 -2.82,2.32 -2.82,4.17 0,2.48 2.02,4.49 4.49,4.49 2.48,0 4.49,-2.01 4.49,-4.49 0,-1.84 -1.11,-3.48 -2.82,-4.17 -0.17,-0.07 -0.25,-0.26 -0.18,-0.43 0.07,-0.17 0.26,-0.25 0.43,-0.18 1.96,0.79 3.23,2.67 3.23,4.78 0,2.84 -2.31,5.16 -5.16,5.16z"/>
              </Svg>
            </Button>
            
          </View>
        </View>
        {/* 电量统计 */}
        <View className={styles.rwSection}>
          <View className={styles.sectionItemForUsageReport} 
          > 
            <View className={styles.reportIcon}>
              <Svg width='28px' height='28px' viewBox="0 0 6.34 6.34">
                <path fill='#666' fill-rule='nonzero' d="M4.97 1.11l0.78 0 0 4.45 -0.78 0 0 -4.45zm-1.37 2l0.78 0 0 2.46 -0.78 0 0 -2.46zm-1.37 -0.63l0.78 0 0 3.09 -0.78 0 0 -3.09zm-1.37 1.47l0.78 0 0 1.62 -0.78 0 0 -1.62z"></path>
                <polyline fill='none' stroke='#666' stroke-width='0.43' stroke-linecap='round' stroke-linejoin='round' points="0.22,0.22 0.22,6.12 6.13,6.12"/>
              </Svg>
            </View>      
            <Text 
              className={styles.sectionItemUsageReport} 
              onClick={navigateToHistory}
            >{Strings.getLang('usageReport')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
    );
}

export default Home;