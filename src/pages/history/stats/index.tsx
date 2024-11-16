import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  View,
  Text,
  Image,
  ScrollView,
  getStatisticsRangDay,
  getStatisticsRangMonth,
  showLoading,
  hideLoading,
  Picker,
} from '@ray-js/ray';
import StatCharts from '@ray-js/stat-charts';
import { useDevice, useProps } from '@ray-js/panel-sdk';
import Strings from '@/i18n';
import Tabs from '@ray-js/components-ty-tabs';
import { images } from '@/res';
import styles from './index.module.less';
import Svg from '@ray-js/svg';
import { useDebounceEffect } from 'ahooks';

export function Stats() {
  const [date, setDate] = useState(dayjs());
  const [powerTotal, setPowerTotal] = useState<string>('0.0');
  const [waterTotal, setWaterTotal] = useState<string>('0.0');
  const totalWaterSchema = useDevice(devInfo => devInfo.dpSchema['water_consumption']);
  const totalPowerSchema = useDevice(devInfo => devInfo.dpSchema['power_consumption']);
  const waterUnit = "gal";
  const powerUnit = "kw·h";
  const devId = useDevice(d => d.devInfo.devId);
  const dpState = useProps(state => state); // 获取所有dpState
  const waterConsumption = dpState['water_consumption']
  const powerConsumption = dpState['power_consumption']
  const show_power_consumption: boolean = dpState['show_power_consumption']
  // 防止date 大于今天日期
  if (date>dayjs()) setDate(dayjs());

  // for tab
  let range: '1hour' | '1day' | '1month';
  // for chart
  const [token, setToken] = useState<'day' | 'week' | 'month' | 'year'>('day');
  if (token === 'day') range = '1hour';
  if (token === 'week') range = '1day';
  if (token === 'month') range = '1day';
  if (token === 'year') range = '1month';

  const formatToken = range === '1month' ? 'YYYYMM' : 'YYYYMMDD'; 
  // const startDateFormated = token === 'week' ? date : date.startOf(token).format(formatToken);
  const startDate= token === 'week' ? date.subtract(6, 'day') : date.startOf(token);
  const endDate= token === 'week' ? date : date.endOf(token);
  const startDateFormated = startDate.format(formatToken);
  const endDateFormated = endDate.format(formatToken);

  const show2sLoading = () => {
    showLoading({title: "", mask: true})
    setTimeout(() => {
      hideLoading({})
    }, 2000);
  }
  const datePicker = useCallback(() => {
    const now = dayjs();
    const maxDate = {
      'day': now,
      'week': now,
      'month': now,
      'year': now
    };
    const minDate = {
      'day': now.subtract(364, 'day'),
      'week': now.subtract(51, 'week'),
      'month': now.subtract(12, 'month'),
      'year': now.subtract(12, 'month'),
    };
    let isAddDisabled = false;
    let isMinusDisabled = false;
    let readableFormatToken: string;
    if (token === 'day') {
      const tk = 'YYYYMMDD';
      isAddDisabled = date.add(1, 'day').format(tk) > maxDate['day'].format(tk); // 大于今天则不允许点击
      isMinusDisabled = date.format(tk) <= minDate['day'].format(tk); // 最多只能展示近30天的数据
      readableFormatToken = 'YYYY/MM/DD';
    }
    else if (token === 'week') {
      const tk = 'YYYYMMDD';
      isAddDisabled = date.add(1, 'day').format(tk) > maxDate['week'].format(tk); // 大于今天则不允许点击
      isMinusDisabled = date.format(tk) <= minDate['week'].format(tk); // 最多只能展示近50个周的数据
      readableFormatToken = 'YYYY/MM/DD';
    }
    else if (token === 'month') {
      const tk = 'YYYYMM';
      isAddDisabled = date.add(1, 'month').format(tk) > maxDate['month'].format(tk); // 大于本月则不允许点击
      isMinusDisabled = date.format(tk) <= minDate['month'].format(tk); // 最多只能展示近12个月的数据
      readableFormatToken = 'YYYY.MM';
    }
    else if (token === 'year') {
      const tk = 'YYYY';
      isAddDisabled = date.add(1, 'year').format(tk) > maxDate['year'].format(tk); // 大于本年则不允许点击
      isMinusDisabled = date.format(tk) <= minDate['year'].format(tk); // 最多只能展示近12个月的数据
      readableFormatToken = 'YYYY';
    }
    return (
      <View className={styles['date-selector-container']}>

        <Tabs.SegmentedPicker
          style={{ backgroundColor: '#F9F9F9' }}
          tabBarStyle={{ backgroundColor: '#F9F9F9' }}
          borderRadius="84rpx"
          height="80rpx"
          onChange={(value: 'day' | 'week' | 'month' | 'year') => {
            if (value === 'day') {
              const tk = 'YYYYMMDD';
              if (date.format(tk) > maxDate['day'].format(tk)) {
                setDate(maxDate['day']);
              }
              if (date.format(tk) <= minDate['day'].format(tk)) {
                setDate(minDate['day']);
              }
            } else if (value === 'week') {
              const tk = 'YYYYMM';
              if (date.format(tk) > maxDate['week'].format(tk)) {
                setDate(maxDate['week']);
              }
              if (date.format(tk) <= minDate['week'].format(tk)) {
                setDate(minDate['week']);
              }
            } else if (value === 'month') {
              const tk = 'YYYY';
              if (date.format(tk) > maxDate['month'].format(tk)) {
                setDate(maxDate['month']);
              }
              if (date.format(tk) <= minDate['month'].format(tk)) {
                setDate(minDate['month']);
              }
            } else if (value === 'year') {
              const tk = 'YYYY';
              if (date.format(tk) > maxDate['year'].format(tk)) {
                setDate(maxDate['year']);
              }
              if (date.format(tk) <= minDate['year'].format(tk)) {
                setDate(minDate['year']);
              }
            }
            setToken(value);
            show2sLoading();
          }}
        >
          <Tabs.TabPanel tabKey="day" tab={Strings.getLang('day')} />
          <Tabs.TabPanel tabKey="week" tab={Strings.getLang('week')} />
          <Tabs.TabPanel tabKey="month" tab={Strings.getLang('month')} />
          <Tabs.TabPanel tabKey="year" tab={Strings.getLang('year')} />
        </Tabs.SegmentedPicker>
        <View className={styles['date-selector-content']}>
          <View
            className={styles['date-selector-image-wrapper']}
            style={{ opacity: isMinusDisabled ? 0.3 : 1 }}
            onTouchEnd={() => {
              if (isMinusDisabled) return;
              if (token === 'week') {
                setDate(date.subtract(7, 'day'));
              } else {
                setDate(date.subtract(1, token));
              }
              show2sLoading();
            }}
          >
            <Image src={images.arrow} className={styles['date-selector-image']} />
          </View>
          <Picker 
            className={styles['date-selector-text']}
            mode='date'
            value={date.format('YYYY-MM-DD')}
            start={minDate[token].format('YYYY-MM-DD')}
            end={maxDate[token].format('YYYY-MM-DD')}
            fields={token==='week'?'day':token}
            confirmText={Strings.getLang('confirm')}
            cancelText={Strings.getLang('cancel')}
            onChange={(event) => {
              setDate(dayjs(event.detail.value))
              show2sLoading();
            }}
          >
            <View style={{fontSize: 'large'}}>
              {token === 'week' 
              // start date - end date
                ? startDate.format('YYYY/MM/DD') +' - '+ endDate.format('YYYY/MM/DD')
                : date.format(readableFormatToken)
              }
            </View>
          </Picker>
          <View
            className={styles['date-selector-image-wrapper']}
            style={{ opacity: isAddDisabled ? 0.3 : 1 }}
            onTouchEnd={() => {
              if (isAddDisabled) return;
              if (token === 'week') {
                setDate(date.add(7, 'day'));
              } else {
                setDate(date.add(1, token));
              }
              show2sLoading();
            }}
          >
            <Image src={images.arrow} style={{ transform: 'scale(-1)' }} className={styles['date-selector-image']}/>
          </View>
        </View> 
      </View>
    )
  }, [startDate, endDate, token])

  // water
  useDebounceEffect(() => {
    if (token==='day'||token==='week') {
      getStatisticsRangDay({
        devId,
        dpId: totalWaterSchema.id,
        startDay: startDateFormated,
        endDay: endDateFormated,
        type: 'minux',
      })
      .then(res => {
        console.log("day consumption: ", res)
        if (token==='day') {
          setWaterTotal((parseFloat(res[startDateFormated])).toString())
        } else if (token==='week') {
          const total = Object.values(res).reduce((previousValue: string, currentValue: string) => (parseFloat(previousValue) + parseFloat(currentValue)).toString())
          setWaterTotal((parseFloat(total)).toString())
        }
      })

    } else if (token==='month') {
      getStatisticsRangDay({
        devId,
        dpId: totalWaterSchema.id,
        startDay: startDateFormated,
        endDay: endDateFormated,
        type: 'minux',
      }).then(res => {
        console.log("month consumption: ", res)
        const total = Object.values(res).reduce((previousValue: string, currentValue: string) => (parseFloat(previousValue) + parseFloat(currentValue)).toString())
        setWaterTotal((parseFloat(total)).toString())
      })
    } else if (token==='year') {
      getStatisticsRangMonth({
        devId,
        dpId: totalWaterSchema.id,
        startMonth: startDateFormated,
        endMonth: endDateFormated,
        type: 'minux',
      }).then(res => {
        console.log("year consumption: ", res)
        const total = Object.values(res).reduce((previousValue: string, currentValue: string) => (parseFloat(previousValue) + parseFloat(currentValue)).toString())
        setWaterTotal((parseFloat(total)).toString())
      })
    }
  },[date,token,waterConsumption], { wait: 1000 })

  // power
  useDebounceEffect(() => {
    if (token==='day'||token==='week') {
      getStatisticsRangDay({
        devId,
        dpId: totalPowerSchema.id,
        startDay: startDateFormated,
        endDay: endDateFormated,
        type: 'minux',
      })
      .then(res => {
        console.log("day consumption: ", res)
        if (token==='day') {
          setPowerTotal((parseFloat(res[startDateFormated])).toString())
        } else if (token==='week') {
          const total = Object.values(res).reduce((previousValue: string, currentValue: string) => (parseFloat(previousValue) + parseFloat(currentValue)).toString())
          setPowerTotal((parseFloat(total)).toString())
        }
      })
    } else if (token==='month') {
      getStatisticsRangDay({
        devId,
        dpId: totalPowerSchema.id,
        startDay: startDateFormated,
        endDay: endDateFormated,
        type: 'minux',
      }).then(res => {
        console.log("month consumption: ", res)
        const total = Object.values(res).reduce((previousValue: string, currentValue: string) => (parseFloat(previousValue) + parseFloat(currentValue)).toString())
        setPowerTotal((parseFloat(total)).toString())
      })
    } else if (token==='year') {
      getStatisticsRangMonth({
        devId,
        dpId: totalPowerSchema.id,
        startMonth: startDateFormated,
        endMonth: endDateFormated,
        type: 'minux',
      }).then(res => {
        console.log("year consumption: ", res)
        const total = Object.values(res).reduce((previousValue: string, currentValue: string) => (parseFloat(previousValue) + parseFloat(currentValue)).toString())
        setPowerTotal((parseFloat(total)).toString())
      })
    }
  }, [date,token,powerConsumption]), {wait: 1000};

  return (
    <View className={styles.view}>
      <ScrollView refresherTriggered={false} scrollY> 
        {datePicker()}
        {/* POWER */}
        
        {show_power_consumption && <View>
          <StatCharts
            style={{ width: '686rpx', padding: '0' }}
            devIdList={[devId]}
            dpList={[{ id: totalPowerSchema.id, name: Strings.getLang('powerConsumption') }]}
            unit={powerUnit}
            range={range}
            // @ts-ignore
            type='minux'
            startDate={startDateFormated}
            endDate={endDateFormated}
            chartType="bar"
            width={686}
            height={636}
            debounce={{ wait: 1000, leading: false, trailing: true }}
            renderTitle={() => {
              return (
                <View className={styles.powerInfo}>
                  <Svg width='25px' height='45px' viewBox="0 0 25 45">
                    <polygon fill="#295bdd" points="18.47 2.5 18.47 2.5 1.16 24.5 11.16 24.5 5.16 42.5 23.84 16.5 13.82 16.5 18.47 2.5"/>
                  </Svg>
                  <Text style={{paddingLeft: '4px'}}>
                    <Text style={{fontSize: '20px', paddingLeft: 8}}>You've used </Text>
                    <Text style={{color: "#295bdd", fontSize: '25px', paddingLeft:10, paddingRight:10, fontWeight: 'bold'}}>{powerTotal}</Text>
                    <Text style={{fontSize: '20px'}}>kWh</Text>
                  </Text>
                </View>
              )
            }}
            colors={['#295bdd']}
            debug={false}
            renderFooter={() => {
              return (
                <View style={{padding: '8px'}}>
                  <Text style={{fontSize: '13px', color: '#999'}}>Under normal operation, there’s a ±15% tolerance in power consumption monitoring.</Text>
                </View>
              )
            }}
          />
        </View>}
        <View>
          {/* WATER */}
          <StatCharts
            style={{ width: '686rpx', padding: '0' }}
            devIdList={[devId]}
            dpList={[{ id: totalWaterSchema.id, name: Strings.getLang('waterConsumption') }]}
            unit={waterUnit}
            range={range}
            // @ts-ignore
            type='minux'
            startDate={startDateFormated}
            endDate={endDateFormated}
            chartType="bar"
            width={686}
            height={636}
            debounce={{ wait: 1000, leading: false, trailing: true }}
            renderTitle={() => {
              return (
                <View className={styles.powerInfo}>
                <Svg width='25px' height='45px' viewBox="0 0 22 30.07">
                  <path fill='#4565d5' d='m0,18.74c0-1.98.99-4.52,2.76-7.56.7-1.21,1.52-2.47,2.43-3.78,1.11-1.59,2.27-3.14,3.49-4.65.48-.6.97-1.2,1.47-1.79l.12-.14.73-.84.73.84.12.14c.09.11.2.24.32.38.39.46.77.93,1.15,1.4,1.21,1.51,2.38,3.06,3.49,4.65.91,1.31,1.73,2.57,2.43,3.78,1.77,3.04,2.76,5.58,2.76,7.56,0,6.25-4.92,11.33-11,11.33S0,24.99,0,18.74M10.18,3.98c-1.19,1.47-2.33,2.99-3.41,4.54-.88,1.26-1.67,2.49-2.35,3.65-1.61,2.76-2.49,5.03-2.49,6.57,0,5.19,4.07,9.39,9.07,9.39s9.07-4.2,9.07-9.39c0-1.54-.89-3.81-2.5-6.57-.68-1.16-1.47-2.39-2.35-3.65-1.09-1.55-2.22-3.07-3.41-4.54-.27-.34-.55-.67-.82-1-.25.31-.53.64-.82,1'></path>
                  <path fill='#4565d5' d='m11,26.7c-4.24,0-7.67-3.47-7.67-7.75s3.99-2.11,7.67,0c3.7,2.12,7.67-4.28,7.67,0s-3.44,7.75-7.67,7.75'></path>
                </Svg>
                <Text style={{paddingLeft: '4px'}}>
                  <Text style={{fontSize: '20px', paddingLeft: 8}}>You've used </Text>
                  <Text style={{color: "#295bdd", fontSize: '25px', paddingLeft:10, paddingRight:10, fontWeight: 'bold'}}>{waterTotal}</Text>
                  <Text style={{fontSize: '20px'}}>Gallon</Text>
                </Text>
              </View>
              )
            }}
            renderFooter={() => {
              return (
                <View style={{padding: '8px'}}>
                  <Text style={{fontSize: '13px', color: '#999'}}>Under normal operation, there’s a ±15% tolerance in water consumption monitoring.</Text>
                </View>
              )
            }}
            colors={['#295bdd']}
            debug={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
export default Stats;