// const TimerRenderer = ({ formatted: { days, hours, minutes, seconds } }) => {
//   return (
//     <>
//       <span>
//         {days}days {hours}hrs {minutes}mins {seconds}secs left
//       </span>
//     </>
//   );
// };

// export default TimerRenderer;

const TimerRenderer = ({ formatted: { days, hours, minutes, seconds } }) => {
  return (
    <>
      <span>
        {days > 0 ? days + ' days' : null} {hours > 0 ? hours + ' hrs' : null}{' '}
        {days < 1 && hours < 1 ? minutes + ' mins' : null}{' '}
        {days < 1 && hours < 1 ? seconds + ' secs' : null} left
      </span>
    </>
  );
};

export default TimerRenderer;
