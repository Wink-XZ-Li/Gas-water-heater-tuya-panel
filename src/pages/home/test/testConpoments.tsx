// import React, { useState, useEffect } from 'react';
// import { Text, View, showModal } from '@ray-js/ray';
// import { useActions, useProps } from '@ray-js/panel-sdk';
// import styles from './index.module.less';
// import Slider from '@ray-js/components-ty-slider';

// export function Home2() {
//   const dpState = useProps((state) => state);
//   const actions = useActions();

//   const setTemp = dpState['temp_set'];
//   const [localTemp, setLocalTemp] = useState(setTemp); // 本地状态管理滑块值

//   // 同步状态到本地值
//   useEffect(() => {
//     setLocalTemp(setTemp);
//   }, [setTemp]);

//   function modelSetTemp(temp) {
//     if (temp >= 50) {
//       showModal({
//         title: '',
//         content: 'title',
//         showCancel: true,
//         cancelText: 'no',
//         confirmText: 'yes',
//         success: (params) => {
//           if (params.confirm) {
//             actions['temp_set'].set(temp); // 确认更新状态
//           } else {
//             // 点击 "NO" 恢复滑块值到之前状态
//             setLocalTemp(setTemp); // 本地恢复到初始值
//           }
//         },
//       });
//     } else {
//       actions['temp_set'].set(temp);
//     }
//   }

//   return (
//     <View
//       className={`${styles.stateAndControlSection} ${styles.baseSection}`}
//       style={{ marginTop: '15px' }}
//     >
//       <View className={styles.tempNumRow}>
//         <Text className={styles.tempNum}>{setTemp}</Text>
//         <Text className={styles.tempUnit}>℃</Text>
//       </View>

//       <View
//         className={styles.titleSection_content}
//         style={{ paddingTop: '0px', paddingBottom: '15px' }}
//       >
//         <View className={styles.sectionItem_Slider}>
//           <Slider
//             step={1}
//             value={localTemp} // 使用本地状态值
//             min={35}
//             max={65}
//             onChange={(value) => setLocalTemp(value)} // 立即更新本地值
//             onAfterChange={(value) => modelSetTemp(value)} // 模态确认后处理
//           />
//         </View>
//       </View>
//     </View>
//   );
// }

// export default Home2;