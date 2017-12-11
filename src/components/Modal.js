import React from 'react';
import styled from 'styled-components';

class Modal extends React.Component {
    render() {
      if (this.props.isOpen === false)
        return null

      const Logo = styled.div`
        background: url('logo.png') calc(100% - 68px) center no-repeat #26b7ff;
        background-size: 97px 64px;
        width: 230px;
        height: 96px;
        top: 32px;
        left: -16px;
        position: absolute;
        float: left;
        clear: none;

        &:after {
          content: '';
          width: 16px;
          height: 8px;
          background: url(corner.svg) center no-repeat;
          background-size: 16px 8px;
          position: absolute;
          bottom: 100%;
        }
      `;

      const CloseModal = styled.div`
        position: absolute;
        width: 48px;
        height: 48px;
        top: -24px;
        right: -24px;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
        background: #fff;
        cursor: pointer;

        &:after {
          content: '';
          position: absolute;
          width: 48px;
          height: 48px;
          top: 0;
          right: 0;
          opacity: 0.4;
          background: url(ic-close-16.svg) center no-repeat;
          background-size: 16px 16px;
          transition: opacity 0.2s linear;
        }
        &:hover:after {
          opacity:0.8;
        }
      `;
      const LoginBox =styled.div`
        max-width: 864px;
        width: 60%;
        min-width: 666px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 8px rgba(10, 25, 51, 0.2);
        background: #f5f8fc;
        clear: both;
        margin: 0;
        padding: 0;

        box-sizing: border-box;
        border-radius: 0;

        display: block;
        font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;
        font-size: 13px;
        line-height: 1.54;
        color: #0A1A33;
      `;
      const LoginBoxWrapper =styled.div`
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0,0,0,.6);

      `;
      const LoginBoxLeft =styled.div`
        float: left;
        clear: none;
        width: 50%;

        margin: 0;
        padding: 0;
        box-sizing: border-box;
        border-radius: 0;

        display: block;

        font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;
        font-size: 13px;
        line-height: 1.54;
        color: #0A1A33;
      `;
      const LoginForm = styled.div`
        padding: 160px 48px 0;
        background: #fff;
      `;
      const LoginBoxRight = styled.div`
        padding: 48px;
        float: left;
        clear: none;
        width: 50%;
        margin: 0;
        box-sizing: border-box;
        display: block;
      `;
      const H1Welcome =styled.h1`
        color: #0a1a33;
        font-size: 24px;
        line-height: 32px;
        font-weight: 300;
        margin-bottom: 64px;
        margin: 0;
        padding: 0;
        -webkit-appearance: none;
        box-sizing: border-box;
        border-radius: 0;

        display: block;
        font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;

      `;
      const PWelcome = styled.p`
        opacity: .6;
        color: #0a1a33;
        font-weight: 300;
        line-height: 20px;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        display: block;

        font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;
        font-size: 13px;
      `;
      const LoginBoxBottom = styled.div`
        height: 64px;
        line-height: 64px;
        background-color: rgba(10,25,51,.03);
        width: 100%;
        float: left;
        clear: none;
        margin: 0;
        padding: 0;

        box-sizing: border-box;
        border-radius: 0
        transition: color .15s linear,background .15s linear,box-shadow .15s linear;
        display: block;

        font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;
        font-size: 13px;
        color: #0A1A33;
      `;
      const LoginBottomLeft = styled.div`
        background: #f7f8f9;
        line-height: 64px;
        font-family: 'Open Sans','Droid Sans',Tahoma,Arial,sans-serif;
        font-size: 13px;
        line-height: 1.54;
        color: #0A1A33;
      `;

      return (
        <div className={this.props.containerClassName}>
          <LoginBoxWrapper>
            <LoginBox className={this.props.className}>
              <CloseModal onClick={e => this.close(e)}/>
              <Logo/>
              <LoginBoxLeft>
                <LoginForm>
                  {this.props.children}
                </LoginForm>
              </LoginBoxLeft>
              <LoginBoxRight>
                <H1Welcome>Welcome to <strong>Connect Solutions Insights!</strong></H1Welcome>
                <PWelcome>We deliver expert managed and professional services with custom integration support on the trusted CoSo Cloud private platform, on customer on-premise deployments, or with hybrid implementations.</PWelcome>
              </LoginBoxRight>
              <LoginBoxBottom>
                <LoginBottomLeft>
                </LoginBottomLeft>
              </LoginBoxBottom>
            </LoginBox>
          </LoginBoxWrapper>


        </div>
      )
    }
    close(e) {
      e.preventDefault()

      if (this.props.onClose) {
        this.props.onClose()
      }
    }
  }
  export default Modal;
