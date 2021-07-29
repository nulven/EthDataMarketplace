import React from 'react';
import styled from 'styled-components';

import { Button } from './Button';

const ModalWrapper = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 50%;
  left: 50%;
  height: 500px;
  width: 500px;
  background: white;
  border: 1px solid #ccc;
  transition: 1.1s ease-out;
  box-shadow: -2rem 2rem 2rem rgba(0, 0, 0, 0.2);
  filter: blur(0);
  transform: translate(-50%,-50%);
  opacity: 1;
  visibility: visible;
  padding: 10px;
  z-index: 1;
`;

const ModalButton = styled(Button)`
  margin-top: auto;
`;

const CloseIcon = styled.img`
  position: fixed;
  right: 10px;
  top: 10px;
  width: 30px;
  height: 30px;
  :hover {
   cursor: pointer;
  }
`;

type ModalProps = {
  onClose: () => void;
  show: boolean;
  buttonLabel: string;
  children: any;
}

export default function Modal(props: ModalProps) {
  const onClose = () => {
    props.onClose();
  };

  return (
    <>
      {props.show ?
        <ModalWrapper>
          <>
            {props.children}
          </>
          <CloseIcon src={'./icons8-delete.svg'} onClick={onClose} />
          <ModalButton onClick={onClose}>
            {props.buttonLabel}
          </ModalButton>
        </ModalWrapper>
        : null}
    </>
  );
}
