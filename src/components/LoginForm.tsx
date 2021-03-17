import { Button, Form, Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import styled from 'styled-components';
import { Box, Title, Content } from './Box';
import React from 'react';

type Props = {
  onSubmit?: (value: { username: string; password: string }) => void;
};

export const LoginForm = ({ onSubmit }: Props) => {
  const [form] = useForm();

  return (
    <Wrapper>
      <Title>Login</Title>
      <StyledContent>
        <Form
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onSubmit}
          requiredMark={false}
          form={form}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <ButtonGroup>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            </ButtonGroup>
          </Form.Item>
        </Form>
      </StyledContent>
    </Wrapper>
  );
};

const Wrapper = styled(Box)`
  max-width: 21rem;
  margin: 80px auto;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  line-height: 32px;
`;

const StyledContent = styled(Content)`
  padding: 0 24px 24px 24px;
`;
