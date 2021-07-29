import React, { useEffect } from 'react';

type ResizeProps = {
  containerRef: any;
  contentRef: any;
  slice: any;
  display: string;
  children: any;
}

const Resize = (props: ResizeProps) => {
  let display;

  useEffect(() => {
    const getHash = () => {
      console.log(props.containerRef);
      console.log(props.display);
      display = props.display ? props.display : '';
      if (props.containerRef && props.contentRef) {
        check();
      }
    };
    getHash();
    window.addEventListener('resize', getHash);
  }, [props]);

  const isOverflow = () => {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    ctx.font = '20px times new roman';
    var txt = display;
    const size = ctx.measureText(txt).width + 20;

    return props.containerRef.offsetWidth < size;
  };

  const checkOverflow = (start, end) => {
    const middle = Math.floor((start + end) / 2);
    if (!middle) {
      props.contentRef.innerHTML = display;
      return;
    }
    display = props.slice(middle);
    const _isOverflow = isOverflow();
    if (start === middle) {
      display = props.slice(
        end - (_isOverflow ? 3 : 1),
      );
      props.contentRef.innerHTML = display;
      return;
    }
    if (_isOverflow) {
      checkOverflow(start, middle);
    } else {
      checkOverflow(middle, end);
    }
  };

  const check = () => {
    if (isOverflow()) {
      checkOverflow(0, display.length - 1);
    } else {
      props.contentRef.innerHTML = display;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {props.children}
    </div>
  );
};

export default Resize;
