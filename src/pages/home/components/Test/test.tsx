import RayCircleProgress from '@ray-js/circle-progress';
import React, { useState, useEffect, useRef } from 'react';
import { View, showModal } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';

export function TestCircleProgress() {
    const actions = useActions();
    const temp_c = useProps(state => state)['temp_set'];

    const tempRef = useRef(temp_c);
    const tempToProgress = (temp: number) => ((temp - 35) / 30) * 100;  
    const progressToTemp = (progress: number) => 35 + (progress * 30) / 100;

    const [localProgress, setLocalProgress] = useState(tempToProgress(temp_c));

    useEffect(() => {
        // console.log('useEffect temp_c: ', temp_c);
        setLocalProgress(tempToProgress(temp_c));
        tempRef.current = temp_c;
    }, [temp_c]);

    
    
    const handleEnd = (v: number) => {
        setLocalProgress(v);
        directSetTemp(Math.floor(progressToTemp(v)));
      };
    function directSetTemp(value: number) {
        if (value >= 49) {
          showModal({
            title: '',
            content: "1111",
            showCancel: true,
            cancelText: 'no',
            confirmText: 'yes',
            success: (params) => {
              if (params.confirm) {
                actions['temp_set'].set(value);
              } else if (params.cancel) {
                // 使用 ref 获取最新值
                console.log('cancel temp_c: ', tempRef.current);
                setLocalProgress(tempToProgress(tempRef.current));
              }
            }
          });
        } else {
          actions['temp_set'].set(value);
        }
      }

    return (
        <View>
        <RayCircleProgress
            value={localProgress}
            ringRadius={135}
            innerRingRadius={111}
            startDegree={135}
            offsetDegree={270}
            onTouchMove={value => {
                setLocalProgress(value);
            }}
            onTouchEnd={value => {
                handleEnd(value);
                // const newTemp = Math.floor(progressToTemp(value));
                // // actions['temp_set'].set(newTemp)
                // directSetTemp(newTemp)
            }}
        />
        </View>
    );
}

export default TestCircleProgress;
