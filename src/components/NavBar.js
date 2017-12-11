import React, {
  Component
} from 'react';
import styled from 'styled-components';
import { Navbar, NavItem, MenuItem, NavDropdown, Nav, Button, DropdownButton } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import img from './logo6.png';

class NavBar extends Component{
  constructor(props){
    super(props);
    this.state = {
      ccyear: '2017'
    };
  }

  clearSession(e) {
    delete sessionStorage.sessionKey;
    delete sessionStorage.CSI_username;
    window.location['reload']()
  }


  render(){
const navbar = {backgroundImage: `linear-gradient('to bottom','#2c4053 0','#2c4053 100%') !important`};

    const StyledNav = styled.div`
      background-image: linear-gradient(to bottom,#2c4053 0,#2c4053 100%) !important;
    `;
    const Logo = styled.div`
      background: url(${img}) calc(100% - 10px) center no-repeat;
      background-size: 120px 24px;
      width: 130px;
      height: 24px;

      }
    `;

    return(
      <Navbar inverse collapseOnSelect>

  <Navbar.Header>
    <Navbar.Brand>

    <span><Link to='/'><Logo/></Link></span>
    </Navbar.Brand>
    <Navbar.Toggle />
  </Navbar.Header>

  <Navbar.Collapse>

    <Nav style={navbar} pullRight>
      <NavDropdown eventKey={1} title="Dashboards" id="basic-nav-dropdown">
        <MenuItem eventKey={1.1}>
          <Link to='/Overview/'>Overview</Link>
        </MenuItem>
        <MenuItem eventKey={1.2}>
          <Link to='/Meetings/'>Meetings</Link>
        </MenuItem>
      </NavDropdown>

      <NavDropdown eventKey={3} title="Metrics" id="basic-nav-dropdown2">
        <MenuItem eventKey={3.1}><Link to='/HourlyPeakConcurrency/'>Hourly Peak Concurrency</Link></MenuItem>
        <MenuItem eventKey={3.2}>Per Minute Concurrency</MenuItem>
        <MenuItem eventKey={3.3}>Extended Hourly</MenuItem>
        <MenuItem eventKey={3.4}>Monthly</MenuItem>
        <MenuItem eventKey={3.5}>Daily</MenuItem>
        <MenuItem divider />
        <MenuItem eventKey={3.3}>Usage</MenuItem>
      </NavDropdown>
      <NavDropdown eventKey={3} title="Support" id="basic-nav-dropdown2">

      </NavDropdown>
      <NavDropdown eventKey={3} title="Administration" id="basic-nav-dropdown2">
        <MenuItem eventKey={3.1}><Link to='/HourlyPeakConcurrency/'>Kill Meetings</Link></MenuItem>
        <MenuItem eventKey={3.2}>Notifications</MenuItem>

      </NavDropdown>



    <NavDropdown eventKey={4} title={<span><i className="fa fa-user fa-fw"></i> {sessionStorage.getItem("CSI_username")}</span>}
           >
      <MenuItem eventKey={4.1} href="#" onClick={() =>{this.clearSession()}}>Log Out</MenuItem>
      <MenuItem divider />
      <MenuItem eventKey={4.2}>Change Password</MenuItem>
    </NavDropdown>
    </Nav>

  </Navbar.Collapse>
  </Navbar>
  )
      }
}

export default NavBar;
