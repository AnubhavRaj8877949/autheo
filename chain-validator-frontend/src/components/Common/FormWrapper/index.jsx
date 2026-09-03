import { Wrapper } from './styles';

const FormWrapper = ({ children, ...props }) => {
  return (
    <Wrapper {...props}>
      <div>{children}</div>
    </Wrapper>
  );
};

export default FormWrapper;
