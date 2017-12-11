import React, {
  Component
} from 'react';
import styled from 'styled-components';

class Footer extends Component{
  constructor(props){
    super(props);
  }

  render(){

    const FooterDiv = styled.div`
      margin-top: 50px;
    	border-top: 1px solid #eee;
    	padding: 20px 0;
    	font-size: 12px;
    	color: #999;
    `;

    const ccyear = new Date().getFullYear();

    return(
      <FooterDiv>Copyright &copy; {ccyear} Connect Solutions</FooterDiv>
          )
      }
}

export default Footer;
